import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Store} from "../../../../api/model/store";
import {CreateStore} from "./create.store";
import {Switch} from "../../../../app-common/components/input/switch";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";

export const Stores = () => {
  const [operation, setOperation] = useState('create');
  const [store, setStore] = useState<Store>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useApi<SettingsData<Store>>(Tables.store);
  const {fetchData} = useLoadHook;

  const db = useDB();

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Store>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: ('Name'),
    }),
    columnHelper.accessor('location', {
      header: ('Location'),
    }),
    columnHelper.accessor('id', {
      header: ('Actions'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setStore(info.row.original);
              setOperation('update');
              setModal(true);
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deleteStore(info.getValue().toString(), !info.row.original.is_active);
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${info.row.original.is_active ? 'de-' : ''}activate this store?`}
            >
              <Switch checked={info.row.original.is_active} readOnly/>
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  async function deleteStore(id: string, status: boolean) {
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
        loaderLineItems={3}
        buttons={[
          <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Store
          </Button>
        ]}
      />

      {modal && (
        <CreateStore addModal={modal} onClose={() => {
          setModal(false);
          setOperation('create');
          fetchData();
          setStore(undefined);
        }} operation={operation} entity={store}/>
      )}

    </>
  );
};
