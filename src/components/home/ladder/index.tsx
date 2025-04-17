"use client";

import { Container, Switch, Text } from "kitchn";
import React from "react";
import AddPlayer from "./add-player";
import LadderTable from "./table";
import useSWR from "swr";
import type { APIReponse } from "@/types/api-response";
import type { Summoner } from "@/types/summoner";

const Ladder: React.FC = () => {
	const [selected, setSelected] = React.useState<"tft" | "lol">("tft");
	const { data, error, isLoading } = useSWR(
		`/api/${selected}/ladder`,
		(resource, init) =>
			fetch(resource, init)
				.then((res) => res.json())
				.then((res: APIReponse<Summoner[]>) => res.success && res.data),
		{ refreshInterval: 1000 * 60 * 2 },
	);

	const tabs = [
		{ title: "Teamfight Tactics", value: "tft" },
		{ title: "League of Legends", value: "lol", disabled: true },
	];

	return (
		<Container gap={"large"}>
			<Switch tabs={tabs} selected={selected} setSelected={setSelected} />

			<AddPlayer game={selected} />

			<Container gap={"small"}>
				<Text size={"title"} weight={"bold"}>
					Classement général
				</Text>

				<LadderTable summoners={data} loading={isLoading} />
			</Container>
		</Container>
	);
};

export default Ladder;
