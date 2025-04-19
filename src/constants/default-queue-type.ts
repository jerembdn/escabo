import { Game } from "@/types/game";
import { QueueType } from "@/types/queue-type";

export const DefaultQueueType: Record<Game, QueueType> = {
  lol: QueueType.RankedSolo,
  tft: QueueType.RankedTft,
};
