import { Regions } from "@/constants/regions";
import { riotClient } from "@/services/riot-client";
import type { APIReponse } from "@/types/api-response";
import type { Summoner } from "@/types/summoner";
import { prisma } from "@lib/prisma/client";
import { QueueType } from "@prisma/client";
import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postSummonerToLadderDto = z.object({
  region: z.string({ message: "Region is required" }).refine(
    (region) => {
      return Object.values(Regions).some(
        (regionObj) => regionObj.id === region,
      );
    },
    {
      message: "Invalid region",
    },
  ),
  summonerName: z.string({ message: "Summoner name is required" }).min(3, {
    message: "Summoner name must be at least 3 characters long",
  }),
});

type ResponseData = APIReponse<Summoner>;

const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ game: string }> },
  res: NextResponse<ResponseData>,
) => {
  const { game } = await params;
  if (game !== "lol" && game !== "tft") {
    return Response.json(
      {
        success: false,
        error: {
          message: "Invalid game type",
        },
      },
      {
        status: 400,
      },
    );
  }

  const body = await req.json();
  const validation = postSummonerToLadderDto.safeParse(body);

  if (!validation.success) {
    return Response.json(
      {
        success: false,
        error: {
          message: `Invalid request body: ${validation.error}`,
        },
      },
      {
        status: 400,
      },
    );
  }
  const { region, summonerName } = validation.data;

  // - Check if summoner exists in database
  const existingSummoner = await prisma.summoner.findFirst({
    where: {
      name: summonerName,
      region: Regions[region].id,
    },
  });

  if (existingSummoner) {
    return Response.json({
      success: false,
      error: {
        message: "Summoner is already registered",
      },
    });
  }

  const preSummoner = await riotClient.getSummonerDataByName(
    summonerName,
    Regions[region].id,
  );

  if (!preSummoner) {
    return Response.json(
      {
        success: false,
        error: {
          message: "Summoner not found",
        },
      },
      {
        status: 404,
      },
    );
  }

  // - Add summoner to database
  const summoner = await prisma.summoner.create({
    data: {
      puuid: preSummoner.puuid,
      name: preSummoner.name,
      summonerId: preSummoner.summonerId,
      level: preSummoner.level,
      region: Regions[region].id,
      profileIconId: preSummoner.profileIconId,
      accountId: preSummoner.accountId,
      leagues: {
        createMany: {
          data: preSummoner.leagues,
        },
      },
    },
    include: {
      leagues: true,
    },
  });

  return Response.json({
    success: true,
    data: summoner,
  });
};

const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ game: string }> },
  res: NextResponse<ResponseData>,
) => {
  const { game } = await params;
  if (game !== "lol" && game !== "tft") {
    return Response.json(
      {
        success: false,
        error: {
          message: "Invalid game type",
        },
      },
      {
        status: 400,
      },
    );
  }

  const { searchParams } = new URL(req.url);

  const searchQueueType = searchParams.get("queueType");

  if (
    !searchQueueType ||
    !Object.values(QueueType).includes(searchQueueType as QueueType)
  ) {
    return Response.json(
      {
        success: false,
        error: {
          message: "Invalid queue type",
        },
      },
      {
        status: 400,
      },
    );
  }

  const queueType = searchQueueType as QueueType;

  const summoners = await prisma.summoner.findMany({
    where: {
      leagues: {
        some: {
          queueType: queueType,
        },
      },
    },
    include: {
      leagues: true,
    },
  });

  if (!summoners) {
    return Response.json(
      {
        success: false,
        error: {
          message: "No summoners found",
        },
      },
      {
        status: 404,
      },
    );
  }

  // - Sort summoners by rank, divison and league points
  const sortedSummoners = summoners.sort((a, b) => {
    const aLeague = a.leagues.find((league) => league.queueType === queueType);
    const bLeague = b.leagues.find((league) => league.queueType === queueType);

    if (!aLeague || !bLeague) return 0;

    const bLeagueTier = riotClient.getTierValue(bLeague.tier);
    const aLeagueTier = riotClient.getTierValue(aLeague.tier);

    const bLeagueRank = riotClient.getDivisionValue(bLeague.rank);
    const aLeagueRank = riotClient.getDivisionValue(aLeague.rank);

    return (
      bLeagueTier - aLeagueTier ||
      bLeagueRank - aLeagueRank ||
      bLeague.leaguePoints - aLeague.leaguePoints
    );
  });

  console.log("sorted summoners", sortedSummoners);

  return Response.json({
    success: true,
    data: sortedSummoners,
  });
};

export { GET, POST };
