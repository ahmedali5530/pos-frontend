import {useEffect, useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Setting} from "../../../../api/model/setting";
import {Tables} from "../../../../api/db/tables";
import {PrintForm} from "./print.form";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Button} from "../../../../app-common/components/input/button";
import {useDB} from "../../../../api/db/db";

export const PrintSettings = () => {
  const loadHook = useApi<SettingsData<Setting>>(Tables.setting, [
    'name = "Temp Print"', 'or name = "Final Print"', 'or name = "Summary Print"', 'or name = "Delivery Print"'
  ], []);
  const db = useDB();

  const [data, setData] = useState<Setting>();
  const [formModal, setFormModal] = useState(false);

  const columnHelper = createColumnHelper<Setting>();

  // @ts-ignore
  const columns: any = [
    columnHelper.accessor("name", {
      header: 'Name'
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button
              variant="primary"
              onClick={() => {
                setData(info.row.original);
                setFormModal(true);
              }}
            ><FontAwesomeIcon icon={faPencil}/></Button>
          </>
        );
      },
    }),
  ];

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={loadHook}
        loaderLineItems={columns.length}
        buttons={[]}
      />

      <PrintForm
        open={formModal}
        data={data}
        onClose={() => {
          setFormModal(false);
          setData(undefined);
          loadHook.fetchData();
        }}
      />
    </>
  )
}