"use client";

import { Regions } from "@/constants/regions";
import { APIReponse } from "@/types/api-response";
import { RiotAccountDto } from "@/types/dto/riot/riot-account.dto";
import kitchn, { Container, Icon, Input, Modal, Select } from "kitchn";
import { Plus, X } from "lucide-react";
import React from "react";

type AddSummonerModalProps = {
  active: boolean;
  close: () => void;
};

const AddSummonerModal: React.FC<AddSummonerModalProps> = ({
  active,
  close,
}: AddSummonerModalProps) => {
  const [selectedRegion, setSelectedRegion] = React.useState<string>(
    Regions.EUW.id,
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [riotAccount, setRiotAccount] = React.useState<RiotAccountDto | null>(
    null,
  );

  const timer = React.useRef(null);

  const handleSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentValue = event.target.value;

      if (!currentValue) {
        setRiotAccount(null);
        setError(null);
        setLoading(false);
        return;
      }
      if (currentValue.length < 3) return;

      setLoading(true);

      timer.current && clearTimeout(timer.current);

      timer.current = setTimeout(async () => {
        const fetchResponse = await fetch(
          `/api/players/search?term=${encodeURIComponent(currentValue)}&region=${selectedRegion}`,
        );
        const response: APIReponse<RiotAccountDto> = await fetchResponse.json();

        if (response.success === true) {
          setRiotAccount(response.data);
          setError(null);
          setLoading(false);

          event.target.blur();
        } else {
          setLoading(false);
          setError(response.error.message);
        }
      }, 1000);
    },
    [selectedRegion],
  );

  const handleSubmit = React.useCallback(() => {
    if (!riotAccount) return;

    setLoading(true);
    setError(null);

    fetch("/api/ladder", {
      method: "POST",
      body: JSON.stringify({
        region: selectedRegion,
        summonerName: `${riotAccount.gameName}#${riotAccount.tagLine}`,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLoading(false);
          setRiotAccount(null);
          close();
        } else {
          setLoading(false);
          setError(data.error.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        setError(error.message);
      });
  }, [riotAccount, selectedRegion, close]);

  return (
    <Modal.Modal active={active} onClickOutside={close}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>Ajouter au ladder</Modal.Title>
          <Modal.Subtitle>
            Entre ton Riot ID pour ajouter ton compte au Ladder et comparer avec
            tes amis.
          </Modal.Subtitle>
        </Modal.Header>

        <Container row gap={"small"}>
          <SearchContainer>
            <Input
              placeholder="vrai jijon#EUW"
              autoFocus
              onChange={handleSearch}
              error={error}
              suffixStyling={false}
              {...(error && {
                suffix: <Icon icon={X} accent={"danger"} />,
              })}
            />
          </SearchContainer>

          <Select
            placeholder="Région"
            defaultValue={Regions.EUW.id}
            value={selectedRegion}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              event.preventDefault();

              setSelectedRegion(event.target.value);
            }}
          >
            {Object.values(Regions).map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </Select>
        </Container>
      </Modal.Body>

      <Modal.Actions>
        <Modal.Action type={"dark"} onClick={close}>
          Annuler
        </Modal.Action>

        <Modal.Action
          type={"light"}
          onClick={handleSubmit}
          prefix={<Plus size={16} />}
          loading={loading}
          disabled={!riotAccount}
        >
          Ajouter
        </Modal.Action>
      </Modal.Actions>
    </Modal.Modal>
  );
};

const SearchContainer = kitchn(Container)`
  flex: 1;
`;

export default AddSummonerModal;
