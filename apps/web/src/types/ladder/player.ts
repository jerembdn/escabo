import { Player, PlayerLeague } from "@prisma/client";

export type LadderPlayer = Pick<
  Player,
  "id" | "name" | "profileIconId" | "level" | "lastUpdated"
> &
  Pick<
    PlayerLeague,
    "leaguePoints" | "wins" | "losses" | "rank" | "division"
  > & {
    games: number;
    winrate: number;
  };
