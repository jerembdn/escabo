import { Prisma } from "@prisma/client";

export type PlayerLeagueWithPlayer = Prisma.PlayerLeagueGetPayload<{
  include: {
    player: true;
  };
}>;
