"use client";

import { DefaultQueueType } from "@/constants/default-queue-type";
import { Game } from "@/types/game";
import { Switch } from "kitchn";
import { useRouter } from "next/navigation";

type GameSwitchProps = {
  game: Game;
};

const GameSwitch: React.FC<GameSwitchProps> = ({ game }: GameSwitchProps) => {
  const router = useRouter();

  const tabs = [
    { title: "Teamfight Tactics", value: "tft" },
    { title: "League of Legends", value: "lol" },
  ];

  return (
    <Switch
      marginTop={10}
      tabs={tabs}
      selected={game}
      setSelected={(selectedGame) =>
        router.push(
          `/ladder/${selectedGame}/${DefaultQueueType[selectedGame as Game]}`,
        )
      }
    />
  );
};

export default GameSwitch;
