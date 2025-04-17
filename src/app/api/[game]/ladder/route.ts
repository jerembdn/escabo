import { Regions } from "@/constants/regions";
import { tftClient } from "@/services/tft-client";
import type { APIReponse } from "@/types/api-response";
import type { Summoner } from "@/types/summoner";
import { prisma } from "@lib/prisma/client";
import { QueueType } from "@prisma/client";
import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postSummonerToLadderDto = z.object({
	region: z.string({ message: "Region is required" }).refine(
		(region) => {
			return Object.values(Regions).some(
				(regionObj) => regionObj.id === region,
			);
		},
		{
			message: "Invalid region",
		},
	),
	summonerName: z.string({ message: "Summoner name is required" }).min(3, {
		message: "Summoner name must be at least 3 characters long",
	}),
});

type ResponseData = APIReponse<Summoner>;

const POST = async (
	req: NextRequest,
	{ params }: { params: Promise<{ game: string }> },
	res: NextResponse<ResponseData>,
) => {
	const { game } = await params;
	if (game !== "lol" && game !== "tft") {
		return Response.json(
			{
				success: false,
				error: {
					message: "Invalid game type",
				},
			},
			{
				status: 400,
			},
		);
	}

	const body = await req.json();
	const validation = postSummonerToLadderDto.safeParse(body);

	if (!validation.success) {
		return Response.json(
			{
				success: false,
				error: {
					message: `Invalid request body: ${validation.error}`,
				},
			},
			{
				status: 400,
			},
		);
	}
	const { region, summonerName } = validation.data;

	//TODO - Check if summoner exists in database

	const preSummoner = await tftClient.getSummonerDataByName(
		summonerName,
		Regions[region].id,
	);

	if (!preSummoner) {
		return Response.json(
			{
				success: false,
				error: {
					message: "Summoner not found",
				},
			},
			{
				status: 404,
			},
		);
	}

	// - Add summoner to database
	const summoner = await prisma.summoner.create({
		data: {
			puuid: preSummoner.puuid,
			name: preSummoner.name,
			summonerId: preSummoner.summonerId,
			level: preSummoner.level,
			region: Regions[region].id,
			profileIconId: preSummoner.profileIconId,
			accountId: preSummoner.accountId,
			leagues: {
				createMany: {
					data: preSummoner.leagues,
				},
			},
		},
		include: {
			leagues: true,
		},
	});

	// - Add summoner to ladder
	/* await prisma.ladder.create({
    data: {
      summonerId: summoner.id,
      game,
      region,
    },
  }); */

	return Response.json({
		success: true,
		data: summoner,
	});
};

const GET = async (
	req: NextRequest,
	{ params }: { params: Promise<{ game: string }> },
	res: NextResponse<ResponseData>,
) => {
	const { game } = await params;
	if (game !== "lol" && game !== "tft") {
		return Response.json(
			{
				success: false,
				error: {
					message: "Invalid game type",
				},
			},
			{
				status: 400,
			},
		);
	}

	const summoners = await prisma.summoner.findMany({
		include: {
			leagues: true,
		},
	});

	if (!summoners) {
		return Response.json(
			{
				success: false,
				error: {
					message: "No summoners found",
				},
			},
			{
				status: 404,
			},
		);
	}

	// - Sort summoners by rank, divison and league points
	const sortedSummoners = summoners.sort((a, b) => {
		const aLeague = a.leagues.find(
			(league) => league.queueType === QueueType.RANKED_TFT,
		);
		const bLeague = b.leagues.find(
			(league) => league.queueType === QueueType.RANKED_TFT,
		);

		if (!aLeague || !bLeague) return 0;

		const bLeagueTier = tftClient.getTierValue(bLeague.tier);
		const aLeagueTier = tftClient.getTierValue(aLeague.tier);

		const bLeagueRank = tftClient.getDivisionValue(bLeague.rank);
		const aLeagueRank = tftClient.getDivisionValue(aLeague.rank);

		return (
			bLeagueTier - aLeagueTier ||
			bLeagueRank - aLeagueRank ||
			bLeague.leaguePoints - aLeague.leaguePoints
		);
	});

	return Response.json({
		success: true,
		data: sortedSummoners,
	});
};

export { GET, POST };
