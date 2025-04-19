import { riotClient } from "@/services/riot-client";
import type { APIReponse } from "@/types/api-response";
import type { Summoner } from "@/types/summoner";
import { prisma } from "@lib/prisma/client";
import { QueueType } from "@prisma/client";
import type { NextRequest, NextResponse } from "next/server";

type ResponseData = APIReponse<Summoner>;

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

  const summoners = await prisma.summonerEntity.findMany({
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

  return Response.json({
    success: true,
    data: sortedSummoners,
  });
};

export { GET };
