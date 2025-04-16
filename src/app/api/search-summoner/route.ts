import { tftClient } from "@/services/tft-client";
import type { APIReponse } from "@/types/api-response";
import type { RiotAccount } from "@/types/riot-account";
import type { NextRequest, NextResponse } from "next/server";

type ResponseData = APIReponse<RiotAccount>;

export async function GET(req: NextRequest, res: NextResponse<ResponseData>) {
	const { searchParams } = new URL(req.url);

	const searchTerm = searchParams.get("term");
	const region = searchParams.get("region");
	const limit = Number(searchParams.get("limit")) || 10;

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
		const response = await tftClient.getSummonerByName(
			decodeURIComponent(searchTerm),
			"EUW",
		);

		return Response.json({
			success: true,
			data: response,
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
