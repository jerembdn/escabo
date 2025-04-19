import GameSwitch from "@/components/game-switch";
import Hero from "@/components/home/hero";
import { Game } from "@/types/game";
import { Container, Text } from "kitchn";

type GameLayoutProps = {
  children: React.ReactNode;
  params: {
    game: string;
  };
};

const GameLayout = ({ children, params }: GameLayoutProps) => {
  const { game } = params;

  const gameType = game as Game;

  return (
    <Container>
      <GameSwitch game={gameType} />

      <Hero />

      <Text h1 size="title" weight="bold" marginTop={20}>
        Ladder{" "}
        {
          {
            lol: "League of Legends",
            tft: "Teamfight Tactics",
          }[gameType]
        }
      </Text>

      {children}
    </Container>
  );
};

export default GameLayout;
