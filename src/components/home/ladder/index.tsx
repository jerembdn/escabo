"use client";

import { Container, Switch, Tabs, Text } from "kitchn";
import React from "react";
import AddPlayer from "./add-player";
import LadderTable from "./table";
import useSWR from "swr";
import type { APIReponse } from "@/types/api-response";
import { QueueType, type Summoner } from "@/types/summoner";
import { useRouter } from "next/navigation";

type LadderProps = {
  game: "tft" | "lol";
  queueType: QueueType;
};

const Ladder: React.FC<LadderProps> = ({ game, queueType }) => {
  const router = useRouter();

  /* const [selectedGame, setSelectedGame] = React.useState<"tft" | "lol">(game);
  const [selectedQueueType, setSelectedQueueType] =
    React.useState<QueueType>(queueType); */

  const { data, error, isLoading } = useSWR(
    `/api/${game}/ladder?queueType=${queueType}`,
    (resource, init) =>
      fetch(resource, init)
        .then((res) => res.json())
        .then((res: APIReponse<Summoner[]>) => res.success && res.data),
    { refreshInterval: 1000 * 60 * 2 },
  );

  /* React.useEffect(() => {
    setSelectedQueueType(
      game === "tft" ? QueueType.RankedTft : QueueType.RankedSolo,
    );
  }, [game]); */

  const switchTabs = [
    { title: "Teamfight Tactics", value: "tft" },
    { title: "League of Legends", value: "lol" },
  ];

  const queueTypeTabs =
    game === "tft"
      ? [
          { title: "Ranked", value: QueueType.RankedTft },
          { title: "Double Up", value: QueueType.RankedTftDoubleUp },
        ]
      : [
          { title: "Solo/Duo", value: QueueType.RankedSolo },
          { title: "Flex", value: QueueType.RankedFlex },
        ];

  return (
    <Container gap={"large"} marginTop={"large"}>
      <Switch
        tabs={switchTabs}
        selected={game}
        setSelected={(selectedGame) =>
          router.push(`/ladder/${selectedGame}/${queueType.toLowerCase()}`)
        }
      />

      <AddPlayer game={game} />

      <Container gap={"small"}>
        <Text size={"title"} weight={"bold"}>
          Classement général
        </Text>

        <Tabs
          tabs={queueTypeTabs}
          selected={queueType}
          setSelected={(selectedQueueType) =>
            router.push(
              `/ladder/${game}/${selectedQueueType.toString().toLowerCase()}`,
            )
          }
        />

        <LadderTable
          summoners={data}
          queueType={queueType}
          loading={isLoading}
        />
      </Container>
    </Container>
  );
};

export default Ladder;
