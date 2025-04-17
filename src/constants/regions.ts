import type { Region, RegionId } from "@/types/region";

export const Regions: {
	[key in RegionId]: Region;
} = {
	EUW: {
		id: "EUW",
		name: "Europe de l'Ouest",
		routing: {
			platform: "euw1.api.riotgames.com",
			regional: "europe.api.riotgames.com",
		},
		available: true,
	},
};
