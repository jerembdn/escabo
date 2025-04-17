import type { RiotAccountDto } from "@/types/dto/riot/riot-account.dto";
import { env } from "../../env.mjs";
import {
  QueueType,
  type RankedDivision,
  type RankedTier,
  type Summoner,
} from "@/types/summoner";
import type { RegionId } from "@/types/region";
import { Regions } from "@/constants/regions";
import type { RiotSummonerDto } from "@/types/dto/riot/riot-summoner.dto";
import type { RiotLeagueEntryDto } from "@/types/dto/riot/riot-league-entry.dto";

/**
 * TFT API Client for interacting with the Riot Games API
 */
export class TftApiClient {
  private apiKey: string;

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
  }

  /**
   * Update the API key
   * @param newApiKey New Riot Games API key
   */
  public setApiKey(newApiKey: string): void {
    this.apiKey = newApiKey;
  }

  /**
   * Helper method to make API requests
   * @param url API endpoint URL
   * @returns Promise with JSON response
   */
  private async makeRequest<T>(path: URL | string, host: string): Promise<T> {
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

    // Make the request
    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as T;
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
      case "RANKED_TEAM_5x5":
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
    let url = "/riot/account/v1/accounts/by-riot-id";

    const splitedName = summonerName.split("#");

    const gameName = splitedName[0];
    const tagLine = splitedName[1];

    if (!gameName || !tagLine) {
      throw new Error("Invalid summoner name format. Expected 'name#tag'.");
    }

    url += `/${gameName}/${tagLine}`;

    return this.makeRequest<RiotAccountDto>(
      url,
      this.getRegionalHost(regionId),
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
    const rankedEntries = await this.getRankedEntries(summonerData.id, region);

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
   * Get recent match history for a summoner
   * @param summonerName Summoner name
   * @param region Region code
   * @param count Number of matches to retrieve
   * @returns Promise with match data
   */
  /* public async getRecentMatches(
		summonerName: string,
		region: Region,
		count = 10,
	): Promise<ApiResponse> {
		try {
			// First get the summoner data to get the PUUID
			const summonerData = await this.getSummonerByName(summonerName, region);

			// Get match IDs
			const matchIds = await this.getMatchesByPuuid(
				summonerData.puuid,
				region,
				count,
			);

			// Get full details for each match
			const matchPromises = matchIds.map((matchId) =>
				this.getMatchById(matchId, region),
			);
			const matches = await Promise.all(matchPromises);

			// Process matches to extract the summoner's performance
			const processedMatches = matches
				.map((match) => {
					const participant = match.info.participants.find(
						(p: any) => p.puuid === summonerData.puuid,
					);

					if (!participant) {
						return null;
					}

					return {
						matchId: match.metadata.match_id,
						gameDate: new Date(match.info.game_datetime),
						gameLength: match.info.game_length,
						placement: participant.placement,
						level: participant.level,
						playersEliminated: participant.players_eliminated,
						totalDamage: participant.total_damage_to_players,
						units: participant.units,
						traits: participant.traits,
						augments: participant.augments,
					};
				})
				.filter((match) => match !== null);

			return {
				status: "success",
				matches: processedMatches,
			};
		} catch (error) {
			console.error("Error fetching match history:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Unknown error",
			};
		}
	} */
}

export const tftClient = new TftApiClient(env.RG_API_KEY);
