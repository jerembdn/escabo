"use client";

import DataTable from "@/components/data-table";
import { LadderPlayer } from "@/types/ladder/player";
import type { DataTableColumn } from "@/types/table";
import { Icon, Menu, Text, Tooltip, useModal } from "kitchn";
import { Ellipsis, HardDriveDownload, Trash2 } from "lucide-react";
import React from "react";
import DeleteModal from "./modals/delete-modal";

type LadderTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  loading: boolean;
};

const LadderTable = <T extends LadderPlayer>({
  columns,
  data,
  loading,
}: LadderTableProps<T>) => {
  const [deleteModalActive, openDeleteModal, closeDeleteModal] = useModal();
  const [refreshModalActive, openRefreshModal, closeRefreshModal] = useModal();
  const selectedRowRef = React.useRef<T | null>(null);

  const handleDeleteModal = (row: T) => {
    selectedRowRef.current = row;
    openDeleteModal();
  };

  const handleRefreshModal = (row: T) => {
    selectedRowRef.current = row;
    openRefreshModal();
  };

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
            <Tooltip
              width={"100%"}
              text={`Dernière mise à jour : ${row.lastUpdated}`}
            >
              <Menu.Item color="danger" onClick={() => handleRefreshModal(row)}>
                <Text display={"flex"} style={{ alignItems: "center" }}>
                  <Icon marginRight={5} icon={HardDriveDownload} size={16} />
                  {"Mettre à jour"}
                </Text>
              </Menu.Item>
            </Tooltip>

            <Menu.Item color="danger" onClick={() => handleDeleteModal(row)}>
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
      />

      <DeleteModal
        active={deleteModalActive}
        close={closeDeleteModal}
        player={selectedRowRef.current}
      />

      {/* <RefreshModal
        active={refreshModalActive}
        close={closeRefreshModal}
        player={selectedPlayer}
      /> */}
    </>
  );
};

export default LadderTable;
