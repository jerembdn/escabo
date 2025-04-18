import Hero from "@/components/home/hero";
import Ladder from "@/components/home/ladder";
import { QueueType } from "@/types/summoner";
import { Container } from "kitchn";
import { NextPage } from "next";
import { notFound } from "next/navigation";

const LadderPage: NextPage = async ({
  params,
}: {
  params: Promise<{ game: string; queue_type: string }>;
}) => {
  const { game, queue_type } = await params;

  if (
    (game !== "lol" && game !== "tft") ||
    !queue_type ||
    !Object.values(QueueType).includes(queue_type.toUpperCase() as QueueType)
  ) {
    return notFound();
  }

  return (
    <Container>
      <Hero />

      <Ladder game={game} queueType={queue_type as QueueType} />
    </Container>
  );
};

export default LadderPage;
