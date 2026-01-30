import React, { useState } from "react";
import { USER_LIST, USER_GET } from "../../../../api/routing/routes/backend.app";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "../../../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { TableComponent } from "../../../../app-common/components/table/table";
import { User } from "../../../../api/model/user";
import { CreateUser } from "./create.user";
import { HydraCollection } from "../../../../api/model/hydra";
import { Switch } from "../../../../app-common/components/input/switch";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { jsonRequest } from "../../../../api/request/request";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";

export const Users = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useApi<SettingsData<User>>(Tables.user_account, [], [], 0, 10, ['stores']);
  const { fetchData } = useLoadHook;
  const [user, setUser] = useState<User>();
  const [modal, setModal] = useState(false);

  const db = useDB();

  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.accessor('display_name', {
      header: ('Name'),
    }),
    columnHelper.accessor('username', {
      header: ('Username'),
    }),
    columnHelper.accessor('email', {
      header: ('Email'),
    }),
    columnHelper.accessor('roles', {
      header: ('Roles'),
      cell: info => info.getValue()?.join(', '),
      enableColumnFilter: false,
    }),
    columnHelper.accessor('stores', {
      header: ('Stores'),
      cell: info => info.getValue()?.map(item => item.name).join(', '),
      enableColumnFilter: false,
    }),
    columnHelper.accessor('id', {
      header: ('Actions'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setUser(info.row.original);
              setOperation('update');
              setModal(true);
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteUser(info.getValue().toString(), !info.row.original.is_active);
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${info.row.original.is_active ? 'de-' : ''}activate this user?`}
            >
              <Switch checked={info.row.original.is_active} readOnly/>
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  async function deleteUser(id: string, status: boolean) {

    await db.merge(new StringRecordId(id), {
      is_active: status
    })

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        loaderLineItems={6}
        buttons={[
          <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> User
          </Button>
        ]}
      />

      {modal && (
        <CreateUser
          addModal={modal}
          onClose={() => {
            setUser(undefined);
            setOperation('create');
            setModal(false);
            fetchData();
          }}
          entity={user}
          operation={operation}
        />
      )}

    </>
  );
};
