import { QueueType } from "@prisma/client";

export const findQueueType = (input: string): QueueType => {
  if (!input) {
    throw new Error("Input is required");
  }

  const normalizedInput = input.toLowerCase();

  const queueTypes = Object.values(QueueType);

  const match = queueTypes.find(
    (queueType) => queueType.toLowerCase() === normalizedInput,
  );

  if (!match) {
    throw new Error(`Invalid queue type: ${input}`);
  }

  return match;
};
