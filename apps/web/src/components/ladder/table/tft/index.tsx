import type { DataTableColumn } from "@/types/table";
import { displayRank } from "@/utils/display-rank";
import { Avatar, Container, Image, Text, Tooltip } from "kitchn";
import { getWinrateAccentColor } from "@/utils/get-winrate-accent-color";
import LadderTable from "..";
import { QueueType } from "@prisma/client";
import { LadderPlayer } from "@/types/ladder/player";

export type TFTLadderPlayer = LadderPlayer & {
  top4: number;
  top4rate: number;
};

type LadderTableProps = {
  players?: TFTLadderPlayer[];
  queueType: QueueType;
  loading: boolean;
};

const LadderTftTable: React.FC<LadderTableProps> = ({
  players,
  queueType,
  loading,
}: LadderTableProps) => {
  const columns: DataTableColumn<TFTLadderPlayer>[] = [
    {
      key: "id",
      header: "#",
      sortable: true,
      render: (value, row, index) => {
        return index + 1;
      },
      filterable: false,
    },
    {
      key: "name",
      header: "Nom",
      render: (value, row) => {
        const [name] = value.split("#");

        return (
          <Tooltip text={value}>
            <Container row align="center" gap="small">
              <Avatar
                src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/profileicon/${row.profileIconId}.png`}
              />{" "}
              {name}
            </Container>
          </Tooltip>
        );
      },
    },
    {
      key: "rank",
      header: "Rang",
      render: (_, row) => {
        return (
          <Container row align="center" gap="small">
            <Image
              src={`/static/assets/leagues/${row.rank.toLowerCase()}.png`}
              alt={row.rank}
              width={30}
              height={30}
            />

            {displayRank(row.rank, row.division)}
          </Container>
        );
      },
    },
    {
      key: "leaguePoints",
      header: "LPs",
      render: (value) => `${value} LP`,
      filterable: false,
    },
    {
      key: "winrate",
      header: "Win%",
      render: (value) => (
        <Text
          accent={getWinrateAccentColor(value)}
        >{`${value.toFixed(1)}%`}</Text>
      ),
      sortable: true,
    },
    {
      key: "top4rate",
      header: "Top 4%",
      sortable: true,
      render: (value) => (
        <Text
          accent={getWinrateAccentColor(value)}
        >{`${value.toFixed(1)}%`}</Text>
      ),
      filterable: false,
    },
    {
      key: "games",
      header: "Parties",
      filterable: false,
    },
    {
      key: "wins",
      header: "Victoires",
      filterable: false,
    },
    {
      key: "top4",
      header: "Top 4",
      filterable: false,
    },
  ];

  return <LadderTable columns={columns} data={players} loading={loading} />;
};

export default LadderTftTable;
