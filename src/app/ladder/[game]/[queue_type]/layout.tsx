import AddPlayer from "@/components/home/ladder/add-player";
import { QueueType } from "@/types/summoner";
import { Container, Switch, Tabs, Text } from "kitchn";
import { redirect } from "next/navigation";

const LadderLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ game: string; queue_type: string }>;
}) => {
  const { game, queue_type: queueType } = await params;

  if (["tft", "lol"].includes(game) === false) {
    redirect("/");
  }

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
          redirect(`/ladder/${selectedGame}/${queueType.toLowerCase()}`)
        }
      />

      <AddPlayer game={game as "tft" | "lol"} />

      <Container gap={"small"}>
        <Text size={"title"} weight={"bold"}>
          Classement général
        </Text>

        <Tabs
          tabs={queueTypeTabs}
          selected={queueType}
          setSelected={(selectedQueueType) =>
            redirect(
              `/ladder/${game}/${selectedQueueType.toString().toLowerCase()}`,
            )
          }
        />

        {children}
      </Container>
    </Container>
  );
};

export default LadderLayout;
