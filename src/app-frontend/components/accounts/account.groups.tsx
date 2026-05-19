import {useMemo, useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus} from "@fortawesome/free-solid-svg-icons";
import {StringRecordId} from "surrealdb";
import {useAtom} from "jotai";
import {Button} from "../../../app-common/components/input/button";
import {TableComponent} from "../../../app-common/components/table/table";
import {ConfirmAlert} from "../../../app-common/components/confirm/confirm.alert";
import {Switch} from "../../../app-common/components/input/switch";
import useApi, {SettingsData} from "../../../api/db/use.api";
import {Tables} from "../../../api/db/tables";
import {useDB} from "../../../api/db/db";
import {AccountGroup} from "../../../api/model/account.group";
import {CreateAccountGroup} from "./create.account.group";
import {appState} from "../../../store/jotai";

export const AccountGroups = () => {
  const [{store}] = useAtom(appState);
  const db = useDB();
  const [modal, setModal] = useState(false);
  const [operation, setOperation] = useState<"create" | "update">("create");
  const [group, setGroup] = useState<AccountGroup>();

  const groupListHook = useApi<SettingsData<AccountGroup>>(
    Tables.account_group,
    [`store = ${store?.id}`],
    ["code ASC"],
    0,
    25,
  );

  const columnHelper = createColumnHelper<AccountGroup>();

  const columns = useMemo(() => [
    columnHelper.accessor("code", {header: "Code"}),
    columnHelper.accessor("name", {header: "Name"}),
    columnHelper.accessor("head_type", {
      header: "Main head",
      cell: (info) => info.getValue()?.toUpperCase?.() || "-",
    }),
    columnHelper.accessor("normal_balance", {
      header: "Normal",
      cell: (info) => info.getValue()?.toUpperCase?.() || "-",
    }),
    columnHelper.accessor("is_active", {
      header: "Status",
      cell: (info) => (
        <span className={info.getValue() ? "text-success-600" : "text-danger-600"}>
          {info.getValue() ? "Active" : "Inactive"}
        </span>
      ),
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        const current = info.row.original;
        return (
          <>
            <Button
              type="button"
              variant="primary"
              className="w-[40px]"
              onClick={() => {
                setGroup(current);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}
            >
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={async () => {
                await db.merge(new StringRecordId(current.id.toString()), {
                  is_active: !current.is_active,
                });
                await groupListHook.fetchData();
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${current.is_active ? "de-" : ""}activate this group?`}
            >
              <Switch checked={current.is_active} readOnly/>
            </ConfirmAlert>
          </>
        );
      },
    }),
  ], [columnHelper, db, groupListHook]);

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={groupListHook}
        loaderLineItems={6}
        buttons={[
          <Button
            key="create-group"
            variant="primary"
            onClick={() => {
              setGroup(undefined);
              setOperation("create");
              setModal(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Group
          </Button>,
        ]}
      />

      {modal && (
        <CreateAccountGroup
          addModal={modal}
          operation={operation}
          entity={group}
          onClose={async () => {
            setModal(false);
            setGroup(undefined);
            setOperation("create");
            await groupListHook.fetchData();
          }}
        />
      )}
    </>
  );
};
