"use client";

import DataTable from "@/components/data-table";
import { PlayerWithLeague } from "@/types/player-with-league";
import type { DataTableColumn } from "@/types/table";
import kitchn, { Icon, Menu, Text, useModal } from "kitchn";
import { Ellipsis, HardDriveDownload, Trash2 } from "lucide-react";

type LadderTftTableProps = {
  columns: DataTableColumn<PlayerWithLeague>[];
  data: PlayerWithLeague[];
  loading: boolean;
};

const LadderTable: React.FC<LadderTftTableProps> = ({
  columns,
  data,
  loading,
}: LadderTftTableProps) => {
  const [deleteModalActive, openDeleteModal, closeDeleteModal] = useModal();
  const [refreshModalActive, openRefreshModal, closeRefreshModal] = useModal();

  columns = [
    ...columns,
    {
      key: "id",
      header: "",
      align: "right",
      filterable: false,
      render: (_, row) => (
        <Menu.Container placement="bottomEnd">
          <Menu.Button variant="ghost">
            <Icon icon={Ellipsis} size={16} />
          </Menu.Button>

          <Menu.Content width={200}>
            <Menu.Item color="danger" onClick={openRefreshModal}>
              <Text style={{ display: "flex", alignItems: "center" }}>
                <Icon marginRight={5} icon={HardDriveDownload} size={16} />
                {"Mettre à jour"}
              </Text>
            </Menu.Item>

            <Menu.Item color="danger" onClick={openDeleteModal}>
              <Text
                accent="danger"
                style={{ display: "flex", alignItems: "center" }}
              >
                <Icon marginRight={5} icon={Trash2} accent="danger" size={16} />
                {"Supprimer"}
              </Text>
            </Menu.Item>
          </Menu.Content>
        </Menu.Container>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        itemsPerPage={15}
        rowClassName={(row, index) => Test.inlineStyle}
      />

      {/* {data && (
        <DeleteModal
          active={deleteModalActive}
          close={closeDeleteModal}
          summoner={data[0]}
        />
      )} */}
    </>
  );
};

const Test = kitchn.div`
  background-color: red;
`;

export default LadderTable;
