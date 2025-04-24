"use client";

import { GameType, QueueType } from "@prisma/client";
import kitchn, { Tabs as KitchnTabs } from "kitchn";
import { useRouter } from "next/navigation";

type QueueTypeSwitchProps = {
  gameType: GameType;
  queueType: QueueType;
};

const QueueTypeTabs: React.FC<QueueTypeSwitchProps> = ({
  gameType,
  queueType,
}: QueueTypeSwitchProps) => {
  const router = useRouter();

  const tabs = {
    TFT: [
      { title: "Ranked", value: QueueType.RANKED_TFT },
      { title: "Double Up", value: QueueType.RANKED_TFT_DOUBLE_UP },
    ],
    LOL: [
      { title: "Solo/Duo", value: QueueType.RANKED_SOLO_5x5 },
      { title: "Flex", value: QueueType.RANKED_FLEX_SR },
    ],
  }[gameType as GameType];

  return (
    <Tabs
      marginTop={20}
      marginLeft={12}
      marginRight={12}
      tabs={tabs}
      selected={queueType}
      setSelected={(selectedQueueType) =>
        router.push(
          `/ladder/${gameType.toLowerCase()}/${selectedQueueType.toString().toLowerCase()}`,
        )
      }
    />
  );
};

const Tabs = kitchn(KitchnTabs)`
  box-shadow: none;
`;

export default QueueTypeTabs;
