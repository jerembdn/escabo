"use client";

import { Game } from "@/types/game";
import { QueueType } from "@/types/queue-type";
import kitchn, { Tabs as KitchnTabs } from "kitchn";
import { useRouter } from "next/navigation";

type QueueTypeSwitchProps = {
  game: Game;
  queueType: QueueType;
};

const QueueTypeTabs: React.FC<QueueTypeSwitchProps> = ({
  game,
  queueType,
}: QueueTypeSwitchProps) => {
  const router = useRouter();

  const tabs =
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
    <Tabs
      marginTop={20}
      marginLeft={12}
      tabs={tabs}
      selected={queueType}
      setSelected={(selectedQueueType) =>
        router.push(`/ladder/${game}/${selectedQueueType}`)
      }
    />
  );
};

const Tabs = kitchn(KitchnTabs)`
  box-shadow: none;
`;

export default QueueTypeTabs;
