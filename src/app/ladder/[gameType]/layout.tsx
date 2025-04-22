import GameSwitch from "@/components/ladder/game-switch";
import Hero from "@/components/ladder/hero";
import { findGameType } from "@/utils/find-game-type";
import { Button, Container, Text } from "kitchn";

type GameLayoutProps = {
  children: React.ReactNode;
  params: {
    gameType: string;
  };
};

const GameLayout = ({ children, params }: GameLayoutProps) => {
  const { gameType } = params;

  if (!findGameType(gameType)) throw new Error("Invalid game type");

  return (
    <Container>
      <Container row marginTop={10} gap={"small"}>
        <GameSwitch gameType={findGameType(gameType)} />

        <Button disabled>Se connecter</Button>
      </Container>

      <Hero />

      <Text h1 size="title" weight="bold" marginTop={20}>
        Ladder{" "}
        {
          {
            LOL: "League of Legends",
            TFT: "Teamfight Tactics",
          }[findGameType(gameType)]
        }
      </Text>

      {children}
    </Container>
  );
};

export default GameLayout;
