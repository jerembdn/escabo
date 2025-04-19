import QueueTypeSwitch from "@/components/queue-type-switch";
import { Game } from "@/types/game";
import { QueueType } from "@/types/queue-type";
import { Container } from "kitchn";
import {} from "next/navigation";

type LadderLayoutProps = {
  children: React.ReactNode;
  params: {
    game: string;
    queueType: string;
  };
};

const LadderLayout = ({ children, params }: LadderLayoutProps) => {
  const { game, queueType } = params;

  return (
    <Container>
      <QueueTypeSwitch game={game as Game} queueType={queueType as QueueType} />

      {children}
    </Container>
  );
};

export default LadderLayout;
