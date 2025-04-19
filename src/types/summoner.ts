import { QueueType } from "./queue-type";
import type { RegionId } from "./region";

export type RankedTier =
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND"
  | "EMERALD"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER";

export type RankedDivision = "I" | "II" | "III" | "IV";

export type SummonerLeague = {
  leagueId: string;
  queueType: QueueType;
  tier: RankedTier;
  rank?: RankedDivision;
  wins: number;
  losses: number;
  leaguePoints: number;
};

export type Summoner = {
  name: string;
  puuid: string;
  summonerId: string;
  accountId: string;
  profileIconId: number;
  level: number;
  region: RegionId;
  leagues: SummonerLeague[];
};

/**
 * @see ACCOUNT-V1 {/gameName/tagLine} https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/pme-C0Fl54yIEcN7leh2AMah_HB3SFB5-8KTm22Oq3q8o5vRHfbLXm321H3x50dRUxXJMitScON4fg
 * gameName#tagLine
 * puuid
 *
 * @see SUMMONERS-V4 {puuid} https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/pme-C0Fl54yIEcN7leh2AMah_HB3SFB5-8KTm22Oq3q8o5vRHfbLXm321H3x50dRUxXJMitScON4fg
 * summonerId
 * accountId
 * profileIconId
 * summonerLevel
 *
 * @see TFT-LEAGUE-V1 {summonerId} https://euw1.api.riotgames.com/tft/league/v1/entries/by-summoner/wIX6esxD2birUt6weux_sXhHleLwD_vI-c5SSx60Xs6cG7bo
 * leagueId
 * queueType
 * tier (GOLD)
 * rank (III)
 * leaguePoints (LP)
 * wins
 * losses
 * veteran // means the player has played more than 50 games in the current season
 * hotStreak // means the player is on a winning streak
 * freshBlood // means the player is new to ranked
 * inactive // means the player has not played in the last 28 days
 */
