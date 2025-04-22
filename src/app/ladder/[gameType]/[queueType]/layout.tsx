import QueueTypeSwitch from "@/components/ladder/queue-type-switch";
import { findGameType } from "@/utils/find-game-type";
import { findQueueType } from "@/utils/find-queue-type";
import { Container } from "kitchn";

type LadderLayoutProps = {
  children: React.ReactNode;
  params: {
    gameType: string;
    queueType: string;
  };
};

const LadderLayout = ({ children, params }: LadderLayoutProps) => {
  const { gameType, queueType } = params;

  if (!findGameType(gameType)) throw new Error("Invalid game type");
  if (!findQueueType(queueType)) throw new Error("Invalid queue type");

  return (
    <Container>
      <QueueTypeSwitch
        gameType={findGameType(gameType)}
        queueType={findQueueType(queueType)}
      />

      {children}
    </Container>
  );
};

export default LadderLayout;
