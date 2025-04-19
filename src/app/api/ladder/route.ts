import { Regions } from "@/constants/regions";
import { riotClient } from "@/services/riot-client";
import type { APIReponse } from "@/types/api-response";
import type { Summoner } from "@/types/summoner";
import { prisma } from "@lib/prisma/client";
import type { NextRequest } from "next/server";
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

const POST = async (req: NextRequest) => {
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
  const existingSummoner = await prisma.summonerEntity.findFirst({
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
  const summoner = await prisma.summonerEntity.create({
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

export { POST };
