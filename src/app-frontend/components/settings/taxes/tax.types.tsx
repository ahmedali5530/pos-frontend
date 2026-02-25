import React, {useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Tax} from "../../../../api/model/tax";
import {CreateTax} from "./create.tax";
import {Switch} from "../../../../app-common/components/input/switch";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import {Tables} from "../../../../api/db/tables";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";

export const TaxTypes = () => {
  const [operation, setOperation] = useState("create");
  const [tax, setTax] = useState<Tax>();
  const [modal, setModal] = useState(false);
  const [{store}] = useAtom(appState);
  const db = useDB();

  const useLoadHook = useApi<SettingsData<Tax>>(
    Tables.tax,
    [], [], 0, 10, ['stores']
  );
  const {fetchData} = useLoadHook;

  const columnHelper = createColumnHelper<Tax>();

  const columns: any = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("rate", {
      header: "Rate",
    }),
    columnHelper.accessor("stores", {
      header: "Stores",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.name)
          .join(", "),
    }),
    columnHelper.accessor("id", {
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
                setTax(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteTax(
                  info.getValue().toString(),
                  !info.row.original.is_active
                );
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${
                info.row.original.is_active ? "de-" : ""
              }activate this tax?`}>
              <Switch checked={info.row.original.is_active} readOnly/>
            </ConfirmAlert>
          </>
        );
      },
    }),
  ];

  async function deleteTax(id: string, status: boolean) {
    await db.merge(new StringRecordId(id), {
      is_active: status,
    });

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        loaderLineItems={4}
        buttons={[
          <Button
            variant="primary"
            onClick={() => {
              setModal(true);
              setOperation("create");
            }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Tax
          </Button>
        ]}
      />

      {modal && (
        <CreateTax
          entity={tax}
          onClose={() => {
            setTax(undefined);
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
