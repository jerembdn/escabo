import { Prisma } from "@prisma/client";

export type LadderWithPlayers = Prisma.LadderGetPayload<{
  include: {
    players: {
      include: {
        player: {
          include: {
            leagues: true;
          };
        };
      };
    };
  };
}>;
