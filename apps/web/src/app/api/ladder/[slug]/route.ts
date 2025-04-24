import { tftClient } from "@/services/riot-client";
import { APIReponse } from "@/types/api-response";
import { LadderPlayer } from "@/types/ladder/player";
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

  const ladderPlayers: LadderPlayer[] = players.map((player) => {
    const selectedLeague = player.leagues.find(
      (league) => league.queueType === queueType,
    );
    if (!selectedLeague) return null;

    return {
      id: player.id,
      name: player.name,
      profileIconId: player.profileIconId,
      level: player.level,
      lastUpdated: player.lastUpdated,
      leaguePoints: selectedLeague.leaguePoints,
      games: selectedLeague.wins + selectedLeague.losses,
      wins: selectedLeague.wins,
      winrate: Math.round(
        (selectedLeague.wins / (selectedLeague.wins + selectedLeague.losses)) *
          100,
      ),
      losses: selectedLeague.losses,
      rank: selectedLeague.rank,
      division: selectedLeague.division,
    };
  });

  const sortedPlayers = ladderPlayers.sort((a, b) => {
    const bRank = tftClient.getTierValue(b.rank);
    const aRank = tftClient.getTierValue(a.rank);

    const bDivision = tftClient.getDivisionValue(b.division);
    const aDivision = tftClient.getDivisionValue(a.division);

    return (
      bRank - aRank || bDivision - aDivision || b.leaguePoints - a.leaguePoints
    );
  });

  return Response.json({
    success: true,
    data: sortedPlayers,
  } as APIReponse<LadderPlayer[]>);
};

export { GET };
