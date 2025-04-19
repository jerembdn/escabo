import Ladder from "@/components/home/ladder";
import { Game } from "@/types/game";
import { QueueType } from "@/types/queue-type";
import { Container } from "kitchn";
import { NextPage } from "next";

type LadderPageProps = {
  params: Promise<{
    game: string;
    queueType: string;
  }>;
};

const LadderPage: NextPage<LadderPageProps> = async ({
  params,
}: LadderPageProps) => {
  const { game, queueType } = await params;

  return (
    <Container>
      <Ladder game={game as Game} queueType={queueType as QueueType} />
    </Container>
  );
};

export default LadderPage;
