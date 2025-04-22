import { tftClient } from "@/services/riot-client";
import { findQueueType } from "@/utils/find-queue-type";
import { prisma } from "@lib/prisma/client";
import type { NextRequest } from "next/server";

const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await params;

  //TODO(Temp) - Use static game type for now
  if (!findQueueType(slug)) {
    return Response.json(
      {
        success: false,
        error: {
          message: "Unknown ladder",
        },
      },
      {
        status: 400,
      },
    );
  }

  const queueType = findQueueType(slug);

  const players = await prisma.player.findMany({
    where: {
      leagues: {
        some: {
          queueType,
        },
      },
    },
    include: {
      leagues: true,
    },
  });

  if (!players) {
    return Response.json(
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

  const sortedPlayers = players.sort((a, b) => {
    const aLeague = a.leagues.find((league) => league.queueType === queueType);
    const bLeague = b.leagues.find((league) => league.queueType === queueType);

    if (!aLeague || !bLeague) return 0;

    const bLeagueTier = tftClient.getTierValue(bLeague.tier);
    const aLeagueTier = tftClient.getTierValue(aLeague.tier);

    const bLeagueRank = tftClient.getDivisionValue(bLeague.rank);
    const aLeagueRank = tftClient.getDivisionValue(aLeague.rank);

    return (
      bLeagueTier - aLeagueTier ||
      bLeagueRank - aLeagueRank ||
      bLeague.leaguePoints - aLeague.leaguePoints
    );
  });

  return Response.json({
    success: true,
    data: sortedPlayers,
  });
};

export { GET };
