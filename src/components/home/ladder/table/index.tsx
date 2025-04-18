import DataTable from "@/components/data-table";
import type { DataTableColumn } from "@/types/table";
import type { QueueType, Summoner } from "@/types/summoner";
import { displayRank } from "@/utils/display-rank";
import {
  type AccentColors,
  Avatar,
  Container,
  Image,
  Text,
  Tooltip,
} from "kitchn";

type LadderTableProps = {
  summoners?: Summoner[];
  queueType: QueueType;
  loading: boolean;
};

const LadderTable: React.FC<LadderTableProps> = ({
  summoners,
  queueType,
  loading,
}: LadderTableProps) => {
  const columns: DataTableColumn<Summoner>[] = [
    {
      key: "id",
      header: "#",
      sortable: true,
      render: (value, row, index) => {
        return index + 1;
      },
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
    },
    {
      key: "games",
      header: "Parties",
    },
    {
      key: "wins",
      header: "Victoires",
    },
  ];

  const tableData = !summoners
    ? undefined
    : summoners
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

  return (
    <DataTable
      columns={columns}
      data={tableData}
      searchPlaceholder="Rechercher un joueur"
      loading={loading}
      itemsPerPage={15}
    />
  );
};

const getWinrateAccentColor = (value: number): keyof AccentColors => {
  switch (true) {
    case value > 65:
      return "success";
    case value > 50:
      return "info";
    case value > 45:
      return "warning";
    default:
      return "danger";
  }
};

export default LadderTable;
