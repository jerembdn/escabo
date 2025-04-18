import { Container, Text } from "kitchn";

const Hero: React.FC = () => {
  return (
    <Container gap={"tiny"} align={"center"}>
      <Text size={"extraTitle"} weight={"black"}>
        Escabo
      </Text>

      <Text size={"large"} weight={"bold"}>
        Le ladder de la commu M8, imaginé par la truc family!!
      </Text>
    </Container>
  );
};

export default Hero;
