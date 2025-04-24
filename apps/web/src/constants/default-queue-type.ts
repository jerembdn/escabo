import { GameType, QueueType } from "@prisma/client";

export const DefaultQueueType: Record<GameType, QueueType> = {
  LOL: QueueType.RANKED_SOLO_5x5,
  TFT: QueueType.RANKED_TFT,
};
