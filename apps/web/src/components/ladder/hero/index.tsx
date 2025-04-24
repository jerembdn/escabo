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
      borderColor="dark"
    >
      <Text size={"extraTitle"} weight={"black"}>
        Escabo
      </Text>

      <Text size={"large"} weight={"bold"}>
        Le ladder de la commu M8, imaginé par la truc family!!
      </Text>

      <Container row marginTop={20} gap={"small"}>
        <Button disabled>Créer un ladder</Button>

        <Button type="light" onClick={openModal}>
          Ajouter au ladder
        </Button>
      </Container>

      <AddSummonerModal active={modalActive} close={closeModal} />
    </Container>
  );
};

export default Hero;
