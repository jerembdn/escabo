import type { NextApiRequest } from "next";
import { z } from "zod";

const postSummonerToLadderDto = z.object({
  gameId: z.string(),
  region: z.string(),
  summonerName: z.string(),
});

const POST = async (req: NextApiRequest) => {
  const { gameId, region, summonerName } = postSummonerToLadderDto.parse(req.body);
};

export { POST };
