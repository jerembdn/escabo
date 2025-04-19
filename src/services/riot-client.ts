import type { RiotAccountDto } from "@/types/dto/riot/riot-account.dto";
import { env } from "../../env.mjs";
import type { RegionId } from "@/types/region";
import { Regions } from "@/constants/regions";
import type { RiotSummonerDto } from "@/types/dto/riot/riot-summoner.dto";
import type { RiotLeagueEntryDto } from "@/types/dto/riot/riot-league-entry.dto";
import { EndpointRateLimits } from "@/types/api/endpoint";
import { RiotMatchDto } from "@/types/dto/riot/riot-match.dto";
import { RankedDivision, RankedTier, Summoner } from "@/types/summoner";
import { QueueType } from "@/types/queue-type";

/**
 * Riot API Client for interacting with the Riot Games API
 */
export class RiotApiClient {
  private apiKey: string;

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
  constructor(apiKey: string) {
    this.apiKey = apiKey;

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
   * Update the API key
   * @param newApiKey New Riot Games API key
   */
  public setApiKey(newApiKey: string): void {
    this.apiKey = newApiKey;
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
          `API request failed: ${response.status} ${response.statusText}`,
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

  private getQueueType(queueType: string): QueueType {
    switch (queueType) {
      case "RANKED_TFT":
        return QueueType.RankedTft;
      case "RANKED_TFT_DOUBLE_UP":
        return QueueType.RankedTftDoubleUp;
      case "RANKED_SOLO_5x5":
        return QueueType.RankedSolo;
      case "RANKED_FLEX_SR":
        return QueueType.RankedFlex;
      default:
        throw new Error(`Unknown queue type: ${queueType}`);
    }
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
    const url = `/lol/summoner/v4/summoners/by-puuid/${summonerPuuid}`;

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
    game: "lol" | "tft" = "tft",
  ): Promise<RiotLeagueEntryDto[]> {
    const url =
      game === "tft"
        ? `/tft/league/v1/entries/by-summoner/${summonerId}`
        : `/lol/league/v4/entries/by-summoner/${summonerId}`;

    return this.makeRequest<RiotLeagueEntryDto[]>(
      url,
      this.getPlatformHost(region),
      game === "tft" ? "lol-league" : "tft-league",
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
  ): Promise<Summoner> {
    // Get account data
    const accountData = await this.getAccountByName(summonerName, region);

    if (!accountData) {
      throw new Error("Account not found");
    }

    // - Get summoner data
    const summonerData = await this.getSummonerByPuuid(
      accountData.puuid,
      region,
    );

    if (!summonerData) {
      throw new Error("Summoner not found");
    }

    // Get ranked entries
    const rankedEntries = await Promise.all([
      ...(await this.getRankedEntries(summonerData.id, region, "lol")),
      ...(await this.getRankedEntries(summonerData.id, region, "tft")),
    ]);

    if (!rankedEntries) {
      throw new Error("Ranked entries not found");
    }

    // Create the final summoner object
    const summoner: Summoner = {
      name: `${accountData.gameName}#${accountData.tagLine}`,
      puuid: summonerData.puuid,
      summonerId: summonerData.id,
      accountId: summonerData.accountId,
      profileIconId: summonerData.profileIconId,
      level: summonerData.summonerLevel,
      region,
      leagues: rankedEntries.map((entry) => ({
        leagueId: entry.leagueId,
        leaguePoints: entry.leaguePoints,
        losses: entry.losses,
        wins: entry.wins,
        queueType: this.getQueueType(entry.queueType),
        tier: entry.tier as RankedTier,
        rank: entry.rank as RankedDivision,
      })),
    };

    return summoner;
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
    game: "lol" | "tft" = "lol",
  ): Promise<string[]> {
    const url =
      game === "lol"
        ? `/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
        : `/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`;

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
  async getMatchById(
    matchId: string,
    region: RegionId,
    game: "lol" | "tft" = "lol",
  ): Promise<RiotMatchDto> {
    const url =
      game === "lol"
        ? `/lol/match/v5/matches/${matchId}`
        : `/tft/match/v1/matches/${matchId}`;

    return this.makeRequest<RiotMatchDto>(
      url,
      this.getRegionalHost(region),
      "match",
    );
  }
}

export const riotClient = new RiotApiClient(env.RG_API_KEY);
