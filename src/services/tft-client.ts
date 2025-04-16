import type { RiotAccount } from "@/types/riot-account";
import { env } from "../../env.mjs";

// Type definitions for API responses
export interface SummonerDTO {
	id: string;
	accountId: string;
	puuid: string;
	name: string;
	profileIconId: number;
	revisionDate: number;
	summonerLevel: number;
}

export interface LeagueEntryDTO {
	leagueId: string;
	summonerId: string;
	summonerName: string;
	queueType: string;
	tier: string;
	rank: string;
	leaguePoints: number;
	wins: number;
	losses: number;
	hotStreak: boolean;
	veteran: boolean;
	freshBlood: boolean;
	inactive: boolean;
}

export interface SummonerData {
	summonerName: string;
	summonerId: string;
	level: number;
	region: string;
	ranked: boolean;
	tier: string;
	division: string;
	leaguePoints: number;
	wins: number;
	losses: number;
	winRate: number;
	hotStreak: boolean;
	tierSort: number;
	divisionSort: number;
}

export type Region =
	| "BR"
	| "EUNE"
	| "EUW"
	| "JP"
	| "KR"
	| "LAN"
	| "LAS"
	| "NA"
	| "OCE"
	| "TR"
	| "RU";

/**
 * TFT API Client for interacting with the Riot Games API
 */
export class TftApiClient {
	private apiKey: string;

	// Available regions for TFT
	private regions: Record<string, string> = {
		BR: "br1.api.riotgames.com",
		EUNE: "eun1.api.riotgames.com",
		EUW: "euw1.api.riotgames.com",
		JP: "jp1.api.riotgames.com",
		KR: "kr.api.riotgames.com",
		LAN: "la1.api.riotgames.com",
		LAS: "la2.api.riotgames.com",
		NA: "na1.api.riotgames.com",
		OCE: "oc1.api.riotgames.com",
		TR: "tr1.api.riotgames.com",
		RU: "ru.api.riotgames.com",
	};

	// Regional routing values for TFT ranked data
	private regionalRoutes: Record<string, string> = {
		BR: "americas",
		EUNE: "europe",
		EUW: "europe",
		JP: "asia",
		KR: "asia",
		LAN: "americas",
		LAS: "americas",
		NA: "americas",
		OCE: "sea",
		TR: "europe",
		RU: "europe",
	};

	// Rank tiers for sorting
	private tierValues: Record<string, number> = {
		IRON: 1,
		BRONZE: 2,
		SILVER: 3,
		GOLD: 4,
		PLATINUM: 5,
		DIAMOND: 6,
		MASTER: 7,
		GRANDMASTER: 8,
		CHALLENGER: 9,
	};

	// Division values for sorting
	private divisionValues: Record<string, number> = {
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
	private async makeRequest<T>(url: URL): Promise<T> {
		if (!this.apiKey) {
			throw new Error("API key is not set");
		}
		if (!url) {
			throw new Error("URL is required");
		}

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
	private getRegionHost(region: Region): string {
		if (!this.regions[region]) {
			throw new Error(`Invalid region: ${region}`);
		}
		return this.regions[region];
	}

	/**
	 * Get regional route
	 * @param region Region code
	 * @returns Regional route
	 */
	private getRegionalRoute(region: Region): string {
		if (!this.regionalRoutes[region]) {
			throw new Error(`Invalid region: ${region}`);
		}
		return this.regionalRoutes[region];
	}

	/**
	 * Get tier sort value
	 * @param tier Rank tier string
	 * @returns Numeric sort value
	 */
	private getTierValue(tier: string): number {
		return this.tierValues[tier] || 0;
	}

	/**
	 * Get division sort value
	 * @param division Rank division string
	 * @returns Numeric sort value
	 */
	private getDivisionValue(division: string): number {
		return this.divisionValues[division] || 0;
	}

	/**
	 * Calculate win rate percentage
	 * @param wins Number of wins
	 * @param losses Number of losses
	 * @returns Win rate as a percentage
	 */
	private calculateWinRate(wins: number, losses: number): number {
		const totalGames = wins + losses;
		return totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
	}

	/**
	 * Gets RG summoner data by name
	 *
	 * @param summonerName Summoner name to look up
	 * @param region Region code
	 * @returns Promise with summoner data
	 */
	public async getSummonerByName(
		summonerName: string,
		region: Region,
	): Promise<RiotAccount> {
		const url = new URL(
			`https://${this.getRegionalRoute(region)}.api.riotgames.com/riot/account/v1/accounts/by-riot-id`,
		);

		const splitedName = summonerName.split("#");

		const gameName = splitedName[0];
		const tagLine = splitedName[1];

		if (!gameName || !tagLine) {
			throw new Error("Invalid summoner name format. Expected 'name#tag'.");
		}

		url.pathname += `/${gameName}/${tagLine}`;

		return this.makeRequest<RiotAccount>(url);
	}

	/**
	 * Gets TFT summoner LP and other ranked data for a specific summoner
	 * @param summonerName Summoner name to look up
	 * @param region Region code
	 * @returns Promise with summoner data or error
	 */
	public async getTFTSummonerData(
		summonerName: string,
		region: Region,
	): Promise<ApiResponse> {
		try {
			// Get summoner data by name
			const summonerData = await this.getSummonerByName(summonerName, region);

			// Get ranked data using summoner ID
			const rankedData = await this.getRankedEntries(summonerData.id, region);

			// Format results
			if (rankedData.length === 0) {
				return {
					status: "success",
					data: {
						summonerName: summonerData.name,
						summonerId: summonerData.id,
						level: summonerData.summonerLevel,
						region: region,
						ranked: false,
						tier: "UNRANKED",
						division: "",
						leaguePoints: 0,
						wins: 0,
						losses: 0,
						winRate: 0,
						hotStreak: false,
						tierSort: 0,
						divisionSort: 0,
					},
				};
			}

			// Find TFT ranked data
			const tftRankedData = rankedData.find(
				(queue) => queue.queueType === "RANKED_TFT",
			);

			if (!tftRankedData) {
				return {
					status: "success",
					data: {
						summonerName: summonerData.name,
						summonerId: summonerData.id,
						level: summonerData.summonerLevel,
						region: region,
						ranked: false,
						tier: "UNRANKED",
						division: "",
						leaguePoints: 0,
						wins: 0,
						losses: 0,
						winRate: 0,
						hotStreak: false,
						tierSort: 0,
						divisionSort: 0,
					},
				};
			}

			// Calculate tier and division sort values
			const tierValue = this.getTierValue(tftRankedData.tier);
			const divisionValue = this.getDivisionValue(tftRankedData.rank);

			// Calculate win rate
			const winRate = this.calculateWinRate(
				tftRankedData.wins,
				tftRankedData.losses,
			);

			return {
				status: "success",
				data: {
					summonerName: summonerData.name,
					summonerId: summonerData.id,
					level: summonerData.summonerLevel,
					region: region,
					ranked: true,
					tier: tftRankedData.tier,
					division: tftRankedData.rank,
					leaguePoints: tftRankedData.leaguePoints,
					wins: tftRankedData.wins,
					losses: tftRankedData.losses,
					winRate: winRate,
					hotStreak: tftRankedData.hotStreak,
					tierSort: tierValue,
					divisionSort: divisionValue,
				},
			};
		} catch (error) {
			console.error("Error fetching summoner data:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get recent match history for a summoner
	 * @param summonerName Summoner name
	 * @param region Region code
	 * @param count Number of matches to retrieve
	 * @returns Promise with match data
	 */
	public async getRecentMatches(
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
	}

	/**
	 * Create a leaderboard of multiple summoners
	 * @param summonerList Array of {name, region} objects
	 * @returns Promise with leaderboard data
	 */
	public async createLeaderboard(
		summonerList: Array<{ name: string; region: Region }>,
	): Promise<ApiResponse> {
		try {
			if (summonerList.length === 0) {
				return {
					status: "error",
					message: "Empty summoner list",
				};
			}

			// Fetch data for all summoners
			const summonerPromises = summonerList.map((summoner) =>
				this.getTFTSummonerData(summoner.name, summoner.region),
			);

			const results = await Promise.all(summonerPromises);

			// Filter successful results and extract data
			const leaderboardData = results
				.filter((result) => result.status === "success" && result.data)
				.map((result) => result.data);

			if (leaderboardData.length === 0) {
				return {
					status: "error",
					message: "Could not fetch data for any summoners",
				};
			}

			return {
				status: "success",
				matches: leaderboardData,
			};
		} catch (error) {
			console.error("Error creating leaderboard:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}

export const tftClient = new TftApiClient(env.RG_API_KEY);
