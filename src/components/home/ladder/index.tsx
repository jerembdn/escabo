"use client";

import { Container, Switch, Text } from "kitchn";
import React from "react";
import AddPlayer from "./add-player";
import LadderTable from "./table";

const Ladder: React.FC = () => {
	const [selected, setSelected] = React.useState<"tft" | "lol">("tft");

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

				<LadderTable />
			</Container>
		</Container>
	);
};

export default Ladder;
