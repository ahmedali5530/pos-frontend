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
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";
import { Switch } from "../../../../app-common/components/input/switch";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { jsonRequest } from "../../../../api/request/request";

export const Users = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useApi<HydraCollection<User>>('users', USER_LIST);
  const { fetchData } = useLoadHook;
  const [user, setUser] = useState<User>();
  const [modal, setModal] = useState(false);

  const { t } = useTranslation();

  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.accessor('displayName', {
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
      cell: info => info.getValue().join(', '),
      enableColumnFilter: false,
    }),
    columnHelper.accessor('stores', {
      header: ('Stores'),
      cell: info => info.getValue().map(item => item.name).join(', '),
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
                deleteUser(info.getValue().toString(), !info.row.original.isActive);
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirm deletion"
              description={`Are you sure to ${info.row.original.isActive ? 'de-' : ''}activate this user?`}
            >
              <Switch checked={info.row.original.isActive} readOnly/>
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  async function deleteUser(id: string, status: boolean) {
    await jsonRequest(USER_GET.replace(':id', id), {
      method: 'PUT',
      body: JSON.stringify({
        isActive: status
      })
    });

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        loaderLineItems={6}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> User
          </Button>
        }]}
      />

      <CreateUser addModal={modal} onClose={() => {
        setUser(undefined);
        setOperation('create');
        setModal(false);
        fetchData();
      }} entity={user} operation={operation}/>
    </>
  );
};
