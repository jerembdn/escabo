"use client";

import { Regions } from "@/constants/regions";
import type { APIReponse } from "@/types/api-response";
import type { RiotAccount } from "@/types/riot-account";
import kitchn, {
	Button,
	Combobox,
	Container,
	Icon,
	Input,
	Select,
} from "kitchn";
import { Plus, X } from "lucide-react";
import React from "react";

type AddPlayerProps = {
	game: "tft" | "lol";
};

const AddPlayer: React.FC<AddPlayerProps> = ({ game }: AddPlayerProps) => {
	const [filteredOptions, setFilteredOptions] = React.useState<
		{ label: string; value: string }[]
	>([]);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);
	const [summonerPuuid, setSummonerPuuid] = React.useState<string | null>(null);

	const timer = React.useRef(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleSearch = React.useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const currentValue = event.target.value;

			if (!currentValue) setFilteredOptions([]);
			if (currentValue.length < 3) return;

			setLoading(true);

			timer.current && clearTimeout(timer.current);

			timer.current = setTimeout(async () => {
				const fetchResponse = await fetch(
					`/api/search-summoner?term=${encodeURIComponent(currentValue)}&region=EUW`,
				);
				const response: APIReponse<RiotAccount> = await fetchResponse.json();

				if (response.success === true) {
					setFilteredOptions([
						{
							label: `${response.data.gameName}#${response.data.tagLine}`,
							value: response.data.puuid,
						},
					]);
					setError(null);
					setSummonerPuuid(response.data.puuid);
					setLoading(false);
				} else {
					setLoading(false);
					setFilteredOptions([]);
					setError(response.error.message);
				}
			}, 1000);
		},
		[filteredOptions],
	);

	return (
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
				defaultValue={Regions.find((r) => r.id === "EUW")?.id}
			>
				{Regions.map((region) => (
					<option key={region.id} value={region.id}>
						{region.name}
					</option>
				))}
			</Select>

			<Button
				prefix={<Plus size={16} />}
				loading={loading}
				disabled={!summonerPuuid}
			>
				Ajouter au ladder
			</Button>
		</Container>
	);
};

const SearchContainer = kitchn(Container)`
  flex: 1;
`;

export default AddPlayer;
