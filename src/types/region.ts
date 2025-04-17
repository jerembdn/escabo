export type RegionId = "EUW";

export type Region = {
	id: RegionId;
	name: string;
	routing: {
		platform: string;
		regional: string;
	};
	available: boolean;
};
