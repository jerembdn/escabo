import { tftClient } from "@/services/tft-client";
import type { APIReponse } from "@/types/api-response";
import type { RiotAccountDto } from "@/types/dto/riot/riot-account.dto";
import type { NextRequest, NextResponse } from "next/server";

type ResponseData = APIReponse<RiotAccountDto>;

export async function GET(req: NextRequest, res: NextResponse<ResponseData>) {
	const { searchParams } = new URL(req.url);

	const searchTerm = searchParams.get("term");
	const region = searchParams.get("region");

	if (!searchTerm || !region) {
		return Response.json(
			{
				success: false,
				error: {
					message: "Missing search term or region",
				},
			},
			{
				status: 400,
			},
		);
	}

	try {
		const summoner = await tftClient.getSummonerDataByName(searchTerm, "EUW");

		if (!summoner) {
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

		return Response.json({
			success: true,
			data: {
				gameName: summoner.name.split("#")[0],
				tagLine: summoner.name.split("#")[1],
				puuid: summoner.puuid,
			} satisfies RiotAccountDto,
		});
	} catch (error) {
		return Response.json(
			{
				success: false,
				error: {
					message: `Internal server error: ${error}`,
				},
			},
			{
				status: 500,
			},
		);
	}
}
