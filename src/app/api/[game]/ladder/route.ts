import type { NextRequest } from "next/server";
import { z } from "zod";

const postSummonerToLadderDto = z.object({
  gameId: z.string(),
  region: z.string(),
  summonerName: z.string(),
});

const POST = async (req: NextRequest) => {
  const { gameId, region, summonerName } = postSummonerToLadderDto.parse(req.body);
};

export { POST };
