import { Prisma } from "@prisma/client";

export type PlayerWithLeague = Prisma.PlayerGetPayload<{
  include: {
    leagues: true;
  };
}>;
