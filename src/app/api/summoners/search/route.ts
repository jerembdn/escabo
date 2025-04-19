import { Regions } from "@/constants/regions";
import { riotClient } from "@/services/riot-client";
import type { APIReponse } from "@/types/api-response";
import type { RiotAccountDto } from "@/types/dto/riot/riot-account.dto";
import { prisma } from "@lib/prisma/client";
import type { NextRequest, NextResponse } from "next/server";

type ResponseData = APIReponse<RiotAccountDto>;

export async function GET(req: NextRequest, res: NextResponse<ResponseData>) {
  const { searchParams } = new URL(req.url);

  const searchTerm = searchParams.get("term");
  const searchRegion = searchParams.get("region");

  if (!searchTerm || !searchRegion) {
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

  // - Check if region is valid
  if (!Regions[searchRegion]) {
    return Response.json(
      {
        success: false,
        error: {
          message: "Invalid region",
        },
      },
      {
        status: 400,
      },
    );
  }

  const region = Regions[searchRegion];

  // - Check if summoner exists in database
  const existingSummoner = await prisma.summonerEntity.findFirst({
    where: {
      name: decodeURIComponent(searchTerm),
      region: region.id,
    },
  });

  if (existingSummoner) {
    return Response.json({
      success: false,
      error: {
        message: "Summoner is already registered",
      },
    });
  }

  try {
    const account = await riotClient.getAccountByName(searchTerm, region.id);

    return Response.json({
      success: true,
      data: account,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          message:
            error.message || "An error occurred while fetching summoner data",
        },
      },
      {
        status: 400,
      },
    );
  }
}
