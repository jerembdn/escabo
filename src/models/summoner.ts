import type { Summoner } from "@/types/summoner";
import mongoose from "mongoose";

export type SummonerDocument = mongoose.Document & Summoner;

const SummonerSchema = new mongoose.Schema<Summoner>({
	summonerName: {
		type: String,
		required: true,
	},
	summonerId: {
		type: String,
		required: true,
	},
	level: {
		type: Number,
		required: true,
	},
	region: {
		type: String,
		required: true,
	},
	tft: {
		ranked: {
			type: String,
			required: true,
		},
		tier: {
			type: String,
			required: true,
		},
		divison: {
			type: String,
			required: false,
		},
		winRate: {
			type: Number,
			required: true,
		},
		wins: {
			type: Number,
			required: true,
		},
		losses: {
			type: Number,
			required: true,
		},
		winStreaks: {
			type: Number,
			default: 0,
			required: false,
		},
	},
	tierSort: {
		type: Number,
		default: 0,
	},
});

export default mongoose.models.Summoner ||
	mongoose.model<Summoner>("Summoner", SummonerSchema);
