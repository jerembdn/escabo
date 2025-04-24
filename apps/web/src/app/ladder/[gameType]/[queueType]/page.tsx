import Ladder from "@/components/ladder";
import { findGameType } from "@/utils/find-game-type";
import { findQueueType } from "@/utils/find-queue-type";
import { constructMetadata } from "@/utils/metadata";
import {} from "@prisma/client";
import { Container } from "kitchn";
import { Metadata, NextPage } from "next";

export const generateMetadata = async ({
  params,
}: LadderPageProps): Promise<Metadata> => {
  const { gameType, queueType } = await params;

  if (!findGameType(gameType)) throw new Error("Invalid game type");
  if (!findQueueType(queueType)) throw new Error("Invalid queue type");

  const gameName =
    {
      LOL: "League of Legends",
      TFT: "Teamfight Tactics",
    }[findGameType(gameType)] || gameType;

  const queueTypeName =
    {
      RANKED_TFT: "Classée",
      RANKED_TFT_DOUBLE_UP: "Classée Double Up",
      RANKED_SOLO_5x5: "Classée Solo/Duo",
      RANKED_FLEX_SR: "Classée Flex",
    }[findQueueType(queueType)] || queueType;

  return constructMetadata({
    title: `Ladder ${gameName} - ${queueTypeName}`,
  });
};

type LadderPageProps = {
  params: Promise<{
    gameType: string;
    queueType: string;
  }>;
};

const LadderPage: NextPage<LadderPageProps> = async ({
  params,
}: LadderPageProps) => {
  const { gameType, queueType } = await params;

  return (
    <Container>
      <Ladder
        gameType={findGameType(gameType)}
        queueType={findQueueType(queueType)}
      />
    </Container>
  );
};

export default LadderPage;
