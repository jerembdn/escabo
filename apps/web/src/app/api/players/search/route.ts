import { Regions } from "@/constants/regions";
import { tftClient } from "@/services/riot-client";
import { prisma } from "@lib/prisma/client";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
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

  // - Check if player exists in database
  const existingPlayer = await prisma.player.findFirst({
    where: {
      name: decodeURIComponent(searchTerm),
      region: region.id,
    },
  });

  if (existingPlayer) {
    return Response.json({
      success: false,
      error: {
        message: "Player is already registered",
      },
    });
  }

  try {
    const account = await tftClient.getAccountByName(searchTerm, region.id);

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
