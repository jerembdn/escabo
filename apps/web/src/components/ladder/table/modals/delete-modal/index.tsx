import { LadderPlayer } from "@/types/ladder/player";
import { Modal } from "kitchn";

type DeleteModalProps = {
  active: boolean;
  close: () => void;
  player: LadderPlayer | null;
};

const DeleteModal: React.FC<DeleteModalProps> = ({
  active,
  close,
  player,
}: DeleteModalProps) => {
  if (!player) return null;

  return (
    <Modal.Modal active={active} onClickOutside={close}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>Supprimer du ladder</Modal.Title>
          <Modal.Subtitle>
            Es-tu sûr de vouloir supprimer <strong>{player.name}</strong> du
            ladder ?
          </Modal.Subtitle>
        </Modal.Header>
      </Modal.Body>

      <Modal.Actions>
        <Modal.Action type={"dark"} onClick={close}>
          Annuler
        </Modal.Action>

        {/* <Modal.Action
          type={"light"}
          onClick={handleSubmit}
          prefix={<Plus size={16} />}
          loading={loading}
          disabled={!riotAccount}
        >
          Ajouter
        </Modal.Action> */}
      </Modal.Actions>
    </Modal.Modal>
  );
};

export default DeleteModal;
