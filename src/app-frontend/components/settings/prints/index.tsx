import {useEffect, useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Setting} from "../../../../api/model/setting";
import {Tables} from "../../../../api/db/tables";
import {PrintForm} from "./print.form";
import {LabelPrintForm} from "./label.print.form";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Button} from "../../../../app-common/components/input/button";
import {useDB} from "../../../../api/db/db";
import {
  DEFAULT_LABEL_PRINT_CONFIG,
  LABEL_PRINT_SETTING_NAME,
} from "../../../../lib/print/label.print.config";

const PRINT_SETTING_FILTER =
  '(name = "Temp Print" or name = "Final Print" or name = "Summary Print" or name = "Delivery Print" or name = "Label Print")';

export const PrintSettings = () => {
  const loadHook = useApi<SettingsData<Setting>>(Tables.setting, [
    PRINT_SETTING_FILTER,
  ], []);
  const db = useDB();

  const [data, setData] = useState<Setting>();
  const [formModal, setFormModal] = useState(false);

  useEffect(() => {
    const ensureLabelPrint = async () => {
      const [rows] = await db.query(
        `SELECT * FROM ${Tables.setting} WHERE name = $name LIMIT 1`,
        {name: LABEL_PRINT_SETTING_NAME}
      );
      if (!rows?.length) {
        await db.create(Tables.setting, {
          name: LABEL_PRINT_SETTING_NAME,
          values: DEFAULT_LABEL_PRINT_CONFIG,
        });
        loadHook.fetchData();
      }
    };
    ensureLabelPrint();
  }, []);

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

  const isLabelPrint = data?.name === LABEL_PRINT_SETTING_NAME;

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={loadHook}
        loaderLineItems={columns.length}
        buttons={[]}
      />

      {isLabelPrint ? (
        <LabelPrintForm
          open={formModal}
          data={data}
          onClose={() => {
            setFormModal(false);
            setData(undefined);
            loadHook.fetchData();
          }}
        />
      ) : (
        <PrintForm
          open={formModal}
          data={data}
          onClose={() => {
            setFormModal(false);
            setData(undefined);
            loadHook.fetchData();
          }}
        />
      )}
    </>
  )
}
