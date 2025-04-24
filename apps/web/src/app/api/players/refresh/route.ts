import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma/client";
import { GameType, RankedDivision, RankedTier } from "@prisma/client";
import { lolClient, RiotApiClient, tftClient } from "@/services/riot-client";
import { findQueueType } from "@/utils/find-queue-type";
import { env } from "../../../../../env.mjs";

const POST = async (req: NextRequest) => {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid authorization",
        },
      },
      {
        status: 400,
      },
    );
  }

  try {
    const players = await prisma.player.findMany({
      include: { gameIdentifiers: true },
    });

    if (!players || players.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No players found",
          },
        },
        {
          status: 404,
        },
      );
    }

    const results = {
      total: players.length,
      updated: 0,
      failed: 0,
      failures: [] as string[],
    };

    for (const player of players) {
      for (const gameType of Object.values(GameType)) {
        try {
          const client = getClient(gameType);
          const gameIdentifier = player.gameIdentifiers.find(
            (identifier) => identifier.gameType === gameType,
          );

          if (!gameIdentifier) {
            throw new Error(
              `No game identifier found for player ${player.name}`,
            );
          }

          const { account, summoner, rankedEntries } =
            await client.getSummonerRefreshDataByPuuid(
              gameIdentifier.puuid,
              player.region,
            );

          await prisma.player.update({
            where: { id: player.id },
            data: {
              name: `${account.gameName}#${account.tagLine}`,
              profileIconId: summoner.profileIconId,
              level: summoner.summonerLevel,
            },
          });

          for (const entry of rankedEntries) {
            await prisma.playerLeague.upsert({
              where: {
                playerId_queueType: {
                  playerId: player.id,
                  queueType: findQueueType(entry.queueType),
                },
              },
              create: {
                playerId: player.id,
                leagueId: entry.leagueId,
                leaguePoints: entry.leaguePoints,
                losses: entry.losses,
                wins: entry.wins,
                queueType: findQueueType(entry.queueType),
                rank: entry.tier as RankedTier,
                division: entry.rank as RankedDivision,
              },
              update: {
                losses: entry.losses,
                wins: entry.wins,
                leaguePoints: entry.leaguePoints,
                rank: entry.tier as RankedTier,
                division: entry.rank as RankedDivision,
              },
            });
          }

          results.updated++;
        } catch (error) {
          console.error("Error refreshing player:", error);
          results.failed++;
          results.failures.push(
            `${player.name}: ${error.message || "Unknown error"}`,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error refreshing players:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to refresh players",
          details: error.message || "Unknown error",
        },
      },
      {
        status: 500,
      },
    );
  }
};

const getClient = (gameType: GameType): RiotApiClient => {
  switch (gameType) {
    case GameType.LOL:
      return lolClient;
    case GameType.TFT:
      return tftClient;
    default:
      throw new Error("Invalid game type");
  }
};

export { POST };
