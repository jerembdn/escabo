type TFTSummoner = {
  ranked: string;
  tier: string;
  division?: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number;
  hotStreak: boolean;
};

export type Summoner = {
  summonerName: string;
  summonerId: string;
  level: number;
  region: string;
  tft: TFTSummoner;
  tierSort: number;
  divisionSort: number;
};