import { Regions } from "@/constants/regions";
import { lolClient, tftClient } from "@/services/riot-client";
import { RiotLeagueEntryDto } from "@/types/dto/riot/riot-league-entry.dto";
import { findQueueType } from "@/utils/find-queue-type";
import { prisma } from "@lib/prisma/client";
import { GameType, RankedDivision, RankedTier } from "@prisma/client";
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
  const { region: regionStr, summonerName } = validation.data;

  const region = Regions[regionStr];

  // - Check if player exists in database
  const existingPlayer = await prisma.player.findFirst({
    where: {
      name: summonerName,
      region: region.id,
    },
  });

  if (existingPlayer) {
    return Response.json({
      success: false,
      error: {
        message: "Player is already registered",
      },
    });
  }

  const dataPromises = [
    tftClient.getSummonerDataByName(summonerName, region.id),
    lolClient.getSummonerDataByName(summonerName, region.id),
  ];
  const [tft, lol] = await Promise.all(dataPromises);

  //TODO - Fetch match history for TFT to get top4 count

  // - Add summoner to database
  const player = await prisma.player.create({
    data: {
      name: `${lol.account.gameName}#${lol.account.tagLine}`,
      profileIconId: lol.summoner.profileIconId,
      level: lol.summoner.summonerLevel,
      region: region.id,
      gameIdentifiers: {
        create: [
          {
            gameType: GameType.LOL,
            summonerId: lol.summoner.id,
            puuid: lol.summoner.puuid,
            accountId: lol.summoner.accountId,
          },
          {
            gameType: GameType.TFT,
            summonerId: tft.summoner.id,
            puuid: tft.summoner.puuid,
            accountId: tft.summoner.accountId,
          },
        ],
      },
      leagues: {
        create: [
          ...tft.rankedEntries.map(buildRankedEntry),
          ...lol.rankedEntries.map(buildRankedEntry),
        ],
      },
    },
    include: {
      leagues: true,
    },
  });

  return Response.json({
    success: true,
    data: player,
  });
};

const buildRankedEntry = (entry: RiotLeagueEntryDto) => ({
  leagueId: entry.leagueId,
  leaguePoints: entry.leaguePoints,
  losses: entry.losses,
  wins: entry.wins,
  queueType: findQueueType(entry.queueType),
  tier: entry.tier as RankedTier,
  rank: entry.rank as RankedDivision,
});

export { POST };
