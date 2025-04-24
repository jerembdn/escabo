"use client";

import type { APIReponse } from "@/types/api-response";
import { LadderPlayer } from "@/types/ladder/player";
import { GameType, QueueType } from "@prisma/client";
import React from "react";
import useSWR from "swr";
import LadderLolTable from "./table/lol";
import LadderTftTable from "./table/tft";

type LadderProps = {
  gameType: GameType;
  queueType: QueueType;
};

const Ladder: React.FC<LadderProps> = ({ gameType, queueType }) => {
  const { data, error, isLoading } = useSWR(
    `/api/ladder/${queueType.toLowerCase()}`,
    (resource, init) =>
      fetch(resource, init)
        .then((res) => res.json())
        .then((res: APIReponse<LadderPlayer[]>) => res.success && res.data),
    { refreshInterval: 1000 * 60 * 2 },
  );

  return {
    LOL: (
      <LadderLolTable
        players={data}
        queueType={queueType}
        loading={isLoading}
      />
    ),
    TFT: (
      <LadderTftTable
        players={
          data
            ? data.map((player) => ({
                ...player,
                top4: player.wins,
                top4rate: Math.round(
                  (player.wins / (player.wins + player.losses)) * 100,
                ),
                wins: 0,
                winrate: 0,
              }))
            : undefined
        }
        queueType={queueType}
        loading={isLoading}
      />
    ),
  }[gameType];
};

export default Ladder;
