import type { DataTableColumn } from "@/types/table";
import { displayRank } from "@/utils/display-rank";
import { Avatar, Container, Image, Text, Tooltip } from "kitchn";
import { getWinrateAccentColor } from "@/utils/get-winrate-accent-color";
import LadderTable from "..";
import { PlayerWithLeague } from "@/types/player-with-league";
import { Player, QueueType } from "@prisma/client";

type LadderLolTableProps = {
  players?: PlayerWithLeague[];
  queueType: QueueType;
  loading: boolean;
};

const LadderLolTable: React.FC<LadderLolTableProps> = ({
  players,
  queueType,
  loading,
}: LadderLolTableProps) => {
  const columns: DataTableColumn<Player>[] = [
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
      render: (value: string) => {
        const [tier, division] = value.split(" ");

        return (
          <Container row align="center" gap="small">
            <Image
              src={`/static/assets/leagues/${tier.toLowerCase()}.png`}
              alt={value}
              width={30}
              height={30}
            />

            {displayRank(tier, division)}
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
  ];

  const tableData = !players
    ? undefined
    : players
        .map((summoner) => {
          const league = summoner.leagues.find(
            (league) => league.queueType === queueType,
          );
          if (!league) return null;

          return {
            ...summoner,
            rank: `${league.tier} ${league.rank}`,
            leaguePoints: league.leaguePoints,
            winrate: (league.wins / (league.wins + league.losses)) * 100,
            games: league.wins + league.losses,
            wins: league.wins,
          };
        })
        .filter((summoner) => summoner !== null);

  return <LadderTable columns={columns} data={tableData} loading={loading} />;
};

export default LadderLolTable;
