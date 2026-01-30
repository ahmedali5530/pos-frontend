import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash,} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {Department} from "../../../../api/model/department";
import {DEPARTMENT_GET, DEPARTMENT_LIST,} from "../../../../api/routing/routes/backend.app";
import {TableComponent} from "../../../../app-common/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateDepartment} from "./create.department";
import {HydraCollection} from "../../../../api/model/hydra";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {jsonRequest} from "../../../../api/request/request";
import {useAtom} from "jotai";
import {appState as AppState} from "../../../../store/jotai";
import {Tables} from "../../../../api/db/tables";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";
import {Switch} from "../../../../app-common/components/input/switch";

export const Departments = () => {
  const [operation, setOperation] = useState("create");
  const db = useDB();

  const useLoadHook = useApi<SettingsData<Department>>(
    Tables.department, [], [], 0, 10, ['store']
  );
  const {fetchData} = useLoadHook;
  const [department, setDepartment] = useState<Department>();
  const [modal, setModal] = useState(false);

  const columnHelper = createColumnHelper<Department>();

  const columns: any[] = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("description", {
      header: "Description",
    }),
    columnHelper.accessor("store", {
      header: "Store",
      cell: (info) => info.getValue()?.name,
      enableColumnFilter: false,
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
                setDepartment(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteDepartment(info.getValue().toString(), !info.row.original.is_active);
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${info.row.original.is_active ? 'de-' : ''}activate this department?`}
            >
              <Switch checked={info.row.original.is_active} readOnly />
            </ConfirmAlert>
          </>
        );
      },
    }),
  ];

  async function deleteDepartment(id: string, status) {
    await db.merge(new StringRecordId(id), {
      is_active: status
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
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Department
          </Button>
        ]}
      />

      {modal && (
        <CreateDepartment
          addModal={modal}
          onClose={() => {
            setModal(false);
            setOperation("create");
            fetchData();
            setDepartment(undefined);
          }}
          operation={operation}
          entity={department}
        />
      )}

    </>
  );
};
