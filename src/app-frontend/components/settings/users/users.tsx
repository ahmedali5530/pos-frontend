import React, {useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {USER_LIST,} from "../../../../api/routing/routes/backend.app";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {User} from "../../../../api/model/user";
import {CreateUser} from "./create.user";

export const Users = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<User>(USER_LIST);
  const {fetchData} = useLoadHook;
  const [user, setUser] = useState<User>();
  const [modal, setModal] = useState(false);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.accessor('displayName', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('username', {
      header: () => t('Username'),
    }),
    columnHelper.accessor('email', {
      header: () => t('Email'),
    }),
    columnHelper.accessor('roles', {
      header: () => t('Roles'),
      cell: info => info.getValue().join(', ')
    }),
    columnHelper.accessor('stores', {
      header: () => t('Stores'),
      cell: info => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('id', {
      header: () => t('Actions'),
      enableSorting: false,
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
            <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
              <FontAwesomeIcon icon={faTrash}/>
            </Button>
          </>
        )
      }
    })
  ];

  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
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
