"use client";

import React from "react";
import LadderTable from "./table";
import useSWR from "swr";
import type { APIReponse } from "@/types/api-response";
import { Game } from "@/types/game";
import { Summoner } from "@/types/summoner";
import { QueueType } from "@/types/queue-type";

type LadderProps = {
  game: Game;
  queueType: QueueType;
};

const Ladder: React.FC<LadderProps> = ({ game, queueType }) => {
  const { data, error, isLoading } = useSWR(
    `/api/ladder/${game}?queueType=${queueType}`,
    (resource, init) =>
      fetch(resource, init)
        .then((res) => res.json())
        .then((res: APIReponse<Summoner[]>) => res.success && res.data),
    { refreshInterval: 1000 * 60 * 2 },
  );

  return (
    <LadderTable summoners={data} queueType={queueType} loading={isLoading} />
  );
};

export default Ladder;
