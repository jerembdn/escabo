import { Regions } from "@/constants/regions";
import { EndpointRateLimits } from "@/types/api/endpoint";
import type { RiotAccountDto } from "@/types/dto/riot/riot-account.dto";
import type { RiotLeagueEntryDto } from "@/types/dto/riot/riot-league-entry.dto";
import { RiotMatchDto } from "@/types/dto/riot/riot-match.dto";
import type { RiotSummonerDto } from "@/types/dto/riot/riot-summoner.dto";
import { GameType, RankedDivision, RankedTier, RegionId } from "@prisma/client";
import { env } from "../../env.mjs";

/**
 * Riot API Client for interacting with the Riot Games API
 */
export class RiotApiClient {
  private rateLimiters: Map<
    string,
    {
      queue: Array<() => Promise<unknown>>;
      processing: boolean;
      lastRequestTime: number;
    }
  > = new Map();

  private endpointRateLimits: EndpointRateLimits = {
    account: { requests: 100, seconds: 120 },
    summoner: { requests: 500, seconds: 600 },
    league: { requests: 1000, seconds: 600 },
    "match-list": { requests: 100, seconds: 120 },
    match: { requests: 1000, seconds: 600 },

    default: { requests: 20, seconds: 1 },
  };

  // Rank tiers for sorting
  private tierValues: Record<RankedTier, number> = {
    IRON: 1,
    BRONZE: 2,
    SILVER: 3,
    GOLD: 4,
    PLATINUM: 5,
    EMERALD: 6,
    DIAMOND: 7,
    MASTER: 8,
    GRANDMASTER: 9,
    CHALLENGER: 10,
  };

  // Division values for sorting
  private divisionValues: Record<RankedDivision, number> = {
    I: 4,
    II: 3,
    III: 2,
    IV: 1,
  };

  /**
   * Create a new TFT API client
   * @param apiKey Your Riot Games API key
   */
  constructor(
    private readonly apiKey: string,
    private readonly gameType: GameType,
  ) {
    // Initialize rate limiters for each endpoint type
    for (const endpoint in this.endpointRateLimits) {
      this.rateLimiters.set(endpoint, {
        queue: [],
        processing: false,
        lastRequestTime: 0,
      });
    }
  }

  /**
   * Process the rate limit queue for a specific endpoint
   * @param endpointType The endpoint type (account, summoner, etc.)
   */
  private async processQueue(endpointType: string): Promise<void> {
    const limiter = this.rateLimiters.get(endpointType);

    if (!limiter || limiter.processing || limiter.queue.length === 0) {
      return;
    }

    limiter.processing = true;

    try {
      const limits =
        this.endpointRateLimits[endpointType] ||
        this.endpointRateLimits.default;
      const now = Date.now();
      const timeSinceLastRequest = now - limiter.lastRequestTime;
      const minInterval = (limits.seconds * 1000) / limits.requests;

      if (limiter.lastRequestTime > 0 && timeSinceLastRequest < minInterval) {
        const waitTime = minInterval - timeSinceLastRequest;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      const nextRequest = limiter.queue.shift();
      if (nextRequest) {
        limiter.lastRequestTime = Date.now();
        await nextRequest();
      }
    } finally {
      limiter.processing = false;

      if (limiter.queue.length > 0) {
        void this.processQueue(endpointType);
      }
    }
  }

  /**
   * Add a request to the rate limit queue and process it when ready
   * @param endpointType The endpoint type
   * @param requestFn The request function to execute
   * @returns Promise with the request result
   */
  private async scheduleRequest<T>(
    endpointType: string,
    requestFn: () => Promise<T>,
  ): Promise<T> {
    const limiterKey = this.endpointRateLimits[endpointType]
      ? endpointType
      : "default";
    const limiter = this.rateLimiters.get(limiterKey);

    if (!limiter) {
      throw new Error(`Rate limiter not found for endpoint: ${limiterKey}`);
    }

    return new Promise<T>((resolve, reject) => {
      limiter.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!limiter.processing) {
        void this.processQueue(limiterKey);
      }
    });
  }

  /**
   * Helper method to make API requests
   * @param url API endpoint URL
   * @returns Promise with JSON response
   */
  private async makeRequest<T>(
    path: URL | string,
    host: string,
    endpointType: string,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("API key is not set");
    }

    const url = new URL(path, `https://${host}`);

    // Set up request
    const headers = {
      "Content-Type": "application/json",
      "X-Riot-Token": this.apiKey,
    };

    const options: RequestInit = {
      method: "GET",
      headers: headers,
      redirect: "follow",
    };

    return this.scheduleRequest<T>(endpointType, async () => {
      // Make the request
      const response = await fetch(url.toString(), options);

      // Handle rate limit responses
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter
          ? Number.parseInt(retryAfter, 10) * 1000
          : 10000;

        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.makeRequest<T>(path, host, endpointType);
      }

      if (!response.ok) {
        throw new Error(
          `[${this.gameType}_CLIENT] [${response.url}] API request failed: ${response.status} ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    });
  }

  /**
   * Get region host
   * @param region Region code
   * @returns Region-specific host
   */
  private getPlatformHost(regionId: RegionId): string {
    if (!Regions[regionId]) {
      throw new Error(`Invalid region: ${regionId}`);
    }

    return Regions[regionId].routing.platform;
  }

  /**
   * Get regional host
   * @param region Region code
   * @returns Regional route
   */
  private getRegionalHost(region: RegionId): string {
    if (!Regions[region]) {
      throw new Error(`Invalid region: ${region}`);
    }

    return Regions[region].routing.regional;
  }

  /**
   * Get tier sort value
   * @param tier Rank tier string
   * @returns Numeric sort value
   */
  getTierValue(tier: string): number {
    return this.tierValues[tier] || 0;
  }

  /**
   * Get division sort value
   * @param division Rank division string
   * @returns Numeric sort value
   */
  getDivisionValue(division: string): number {
    return this.divisionValues[division] || 0;
  }

  /**
   * Calculate win rate percentage
   * @param wins Number of wins
   * @param losses Number of losses
   * @returns Win rate as a percentage
   */
  calculateWinRate(wins: number, losses: number): number {
    const totalGames = wins + losses;
    return totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  }

  /**
   * Gets RG account data by name
   *
   * @param summonerName Summoner name to look up
   * @param region Region code
   * @returns Promise with account data
   */
  async getAccountByName(
    summonerName: string,
    regionId: RegionId,
  ): Promise<RiotAccountDto> {
    const [gameName, tagLine] = summonerName.split("#");

    if (!gameName || !tagLine) {
      throw new Error("Invalid summoner name format. Expected 'name#tag'.");
    }

    const url = `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;

    return this.makeRequest<RiotAccountDto>(
      url,
      this.getRegionalHost(regionId),
      "account",
    );
  }

  /**
   * Gets RG account data by PUUID
   *
   * @param puuid Player UUID to look up
   * @param regionId Region code
   * @returns Promise with account data
   */
  async getAccountByPuuid(
    puuid: string,
    regionId: RegionId,
  ): Promise<RiotAccountDto> {
    const url = `/riot/account/v1/accounts/by-puuid/${puuid}`;

    return this.makeRequest<RiotAccountDto>(
      url,
      this.getRegionalHost(regionId),
      "account",
    );
  }

  /**
   * Gets summoner data by puuid
   *
   * @param summonerPuuid Summoner PUUID to look up
   * @param regionId Region code
   * @returns Promise with summoner data
   */
  async getSummonerByPuuid(
    summonerPuuid: string,
    regionId: RegionId,
  ): Promise<RiotSummonerDto> {
    const url = {
      TFT: `/tft/summoner/v1/summoners/by-puuid/${summonerPuuid}`,
      LOL: `/lol/summoner/v4/summoners/by-puuid/${summonerPuuid}`,
    }[this.gameType];

    return this.makeRequest<RiotSummonerDto>(
      url,
      this.getPlatformHost(regionId),
      "summoner",
    );
  }

  /**
   * Gets ranked entries for a summoner by ID
   *
   * @param summonerId Summoner ID to look up
   * @param region Region code
   * @returns Promise with ranked entries
   */
  async getRankedEntries(
    summonerId: string,
    region: RegionId,
  ): Promise<RiotLeagueEntryDto[]> {
    const url = {
      TFT: `/tft/league/v1/entries/by-summoner/${summonerId}`,
      LOL: `/lol/league/v4/entries/by-summoner/${summonerId}`,
    }[this.gameType];

    return this.makeRequest<RiotLeagueEntryDto[]>(
      url,
      this.getPlatformHost(region),
      "league",
    );
  }

  /**
   * Gets ranked entries for a summoner by PUUID
   *
   * @param puuid Summoner PUUID to look up
   * @param region Region code
   * @returns Promise with ranked entries
   */
  async getRankedEntriesByPuuid(
    puuid: string,
    region: RegionId,
  ): Promise<RiotLeagueEntryDto[]> {
    const url = {
      LOL: `/lol/league/v4/entries/by-puuid/${puuid}`,
      TFT: `/tft/league/v1/by-puuid/${puuid}`,
    }[this.gameType];

    return this.makeRequest<RiotLeagueEntryDto[]>(
      url,
      this.getPlatformHost(region),
      "league",
    );
  }

  /**
   * Gets summoner data by name
   *
   * @param summonerName Summoner name to look up
   * @param region Region code
   * @returns Promise with summoner data
   */
  async getSummonerDataByName(
    summonerName: string,
    region: RegionId,
  ): Promise<{
    account: RiotAccountDto;
    summoner: RiotSummonerDto;
    rankedEntries: RiotLeagueEntryDto[];
  }> {
    const account = await this.getAccountByName(summonerName, region);

    if (!account) {
      throw new Error("Account not found");
    }

    const summoner = await this.getSummonerByPuuid(account.puuid, region);

    if (!summoner) {
      throw new Error("Summoner not found");
    }

    const rankedEntries = await this.getRankedEntries(summoner.id, region);

    if (!rankedEntries) {
      throw new Error("Ranked entries not found");
    }

    return {
      account,
      summoner,
      rankedEntries,
    };
  }

  async getSummonerRefreshDataByPuuid(
    puuid: string,
    region: RegionId,
  ): Promise<{
    account: RiotAccountDto;
    summoner: RiotSummonerDto;
    rankedEntries: RiotLeagueEntryDto[];
  }> {
    const rankedEntries = await this.getRankedEntriesByPuuid(puuid, region);

    if (!rankedEntries || rankedEntries.length === 0) {
      throw new Error(`No ranked entries found for puuid ${puuid}`);
    }

    const account = await this.getAccountByPuuid(puuid, region);

    if (!account) {
      throw new Error(`Account not found for puuid ${puuid}`);
    }

    const summoner = await this.getSummonerByPuuid(puuid, region);

    if (!summoner) {
      throw new Error(`Summoner not found for puuid ${puuid}`);
    }

    return {
      account,
      summoner,
      rankedEntries,
    };
  }

  /**
   * Get match IDs by summoner PUUID
   *
   * @param puuid Player UUID
   * @param region Region code
   * @param count Number of matches to retrieve
   * @param game Game type (lol or tft)
   * @returns Promise with array of match IDs
   */
  async getMatchIdsByPuuid(
    puuid: string,
    region: RegionId,
    count = 10,
  ): Promise<string[]> {
    const url = {
      TFT: `/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`,
      LOL: `/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
    }[this.gameType];

    return this.makeRequest<string[]>(
      url,
      this.getRegionalHost(region),
      "match-list",
    );
  }

  /**
   * Get match details by match ID
   *
   * @param matchId Match ID
   * @param region Region code
   * @param game Game type (lol or tft)
   * @returns Promise with match data
   */
  async getMatchById(matchId: string, region: RegionId): Promise<RiotMatchDto> {
    const url = {
      TFT: `/tft/match/v1/matches/${matchId}`,
      LOL: `/lol/match/v5/matches/${matchId}`,
    }[this.gameType];

    return this.makeRequest<RiotMatchDto>(
      url,
      this.getRegionalHost(region),
      "match",
    );
  }
}

export const tftClient = new RiotApiClient(env.RG_TFT_API_KEY, GameType.TFT);
export const lolClient = new RiotApiClient(env.RG_LOL_API_KEY, GameType.LOL);
