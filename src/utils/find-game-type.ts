import { GameType } from "@prisma/client";

export const findGameType = (input: string): GameType => {
  if (!input) {
    throw new Error("Input is required");
  }

  const normalizedInput = input.toLowerCase();

  const gameTypes = Object.values(GameType);

  const match = gameTypes.find(
    (gameType) => gameType.toLowerCase() === normalizedInput,
  );

  if (!match) {
    throw new Error(`Invalid game type: ${input}`);
  }

  return match;
};
