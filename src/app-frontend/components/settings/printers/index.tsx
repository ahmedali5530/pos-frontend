import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus,} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {Printer} from "../../../../api/model/printer";
import {createColumnHelper} from "@tanstack/react-table";
import {TableComponent} from "../../../../app-common/components/table/table";
import {PrinterForm} from "./form";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {Switch} from "../../../../app-common/components/input/switch";
import {Tables} from "../../../../api/db/tables";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";

export const Printers = () => {
  const [operation, setOperation] = useState("create");
  const [printer, setPrinter] = useState<Printer>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useApi<SettingsData<Printer>>(
    Tables.printer,
    [], [], 0, 10, ['store']
  );
  const {fetchData} = useLoadHook;

  const db = useDB();

  const columnHelper = createColumnHelper<Printer>();

  const columns: any = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("type", {
      header: "Type",
    }),
    columnHelper.accessor("ip_address", {
      header: "Address",
    }),
    columnHelper.accessor("port", {
      header: "Port",
    }),
    columnHelper.accessor("prints", {
      header: "Prints",
    }),
    columnHelper.accessor("store", {
      header: "Store",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => info.getValue()?.name
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
              type="button"
              variant="primary"
              className="w-[40px]"
              onClick={() => {
                setPrinter(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
          </>
        );
      },
    }),
  ];

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        loaderLineItems={3}
        buttons={[
          <Button
            variant="primary"
            onClick={() => {
              setModal(true);
              setOperation("create");
            }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Printer
          </Button>
        ]}
      />

      {modal && (
        <PrinterForm
          entity={printer}
          onClose={() => {
            setPrinter(undefined);
            setOperation("create");
            setModal(false);
            fetchData();
          }}
          operation={operation}
          addModal={modal}
        />
      )}

    </>
  );
};
