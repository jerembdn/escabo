"use client";

import { DefaultQueueType } from "@/constants/default-queue-type";
import { GameType } from "@prisma/client";
import { Switch } from "kitchn";
import { useRouter } from "next/navigation";

type GameSwitchProps = {
  gameType: GameType;
};

const GameSwitch: React.FC<GameSwitchProps> = ({
  gameType,
}: GameSwitchProps) => {
  const router = useRouter();

  const tabs = [
    { title: "Teamfight Tactics", value: GameType.TFT },
    { title: "League of Legends", value: GameType.LOL },
  ];

  return (
    <Switch
      style={{ flex: 1 }}
      tabs={tabs}
      selected={gameType}
      setSelected={(selectedGame) =>
        router.push(
          `/ladder/${selectedGame.toString().toLowerCase()}/${DefaultQueueType[GameType[selectedGame.toString()]].toLowerCase()}`,
        )
      }
    />
  );
};

export default GameSwitch;
