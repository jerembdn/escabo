import type { RankedTier } from "@/types/summoner";

const rankNames: Record<RankedTier, string> = {
	IRON: "Fer",
	BRONZE: "Bronze",
	SILVER: "Argent",
	GOLD: "Or",
	PLATINUM: "Platine",
	DIAMOND: "Diamant",
	EMERALD: "Émeraude",
	MASTER: "Maître",
	GRANDMASTER: "Grand Maître",
	CHALLENGER: "Challenger",
};

export const displayRank = (tier: string, division?: string) => {
	if (["CHALLENGER", "GRANDMASTER", "MASTER"].includes(tier)) {
		return `${rankNames[tier]}`;
	}

	return `${rankNames[tier]} ${division}`;
};
