"use client";

import { Button, Container, Text, useModal } from "kitchn";
import AddSummonerModal from "./add-player-modal";

type HeroProps = object;

const Hero: React.FC<HeroProps> = () => {
  const [modalActive, openModal, closeModal] = useModal();

  return (
    <Container
      gap={"tiny"}
      align={"center"}
      bg={"darker"}
      borderRadius={"12px"}
      padding={"large"}
      marginTop={20}
    >
      <Text size={"extraTitle"} weight={"black"}>
        Escabo
      </Text>

      <Text size={"large"} weight={"bold"}>
        Le ladder de la commu M8, imaginé par la truc family!!
      </Text>

      <Button type="light" marginTop={20} onClick={openModal}>
        Ajouter au ladder
      </Button>

      <AddSummonerModal active={modalActive} close={closeModal} />
    </Container>
  );
};

export default Hero;
