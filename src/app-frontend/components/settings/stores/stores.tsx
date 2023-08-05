import React, {useState} from "react";
import { PAYMENT_TYPE_GET, STORE_EDIT, STORE_LIST, } from "../../../../api/routing/routes/backend.app";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Store} from "../../../../api/model/store";
import {CreateStore} from "./create.store";
import useApi from "../../../../api/hooks/use.api";
import {HydraCollection} from "../../../../api/model/hydra";
import { Switch } from "../../../../app-common/components/input/switch";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { jsonRequest } from "../../../../api/request/request";

export const Stores = () => {
  const [operation, setOperation] = useState('create');
  const [store, setStore] = useState<Store>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useApi<HydraCollection<Store>>('stores', STORE_LIST);
  const {fetchData} = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Store>();

  const columns = [
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
                deleteStore(info.getValue().toString(), !info.row.original.isActive);
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirm deletion"
              description={`Are you sure to ${info.row.original.isActive ? 'de-' : ''}activate this store?`}
            >
              <Switch checked={info.row.original.isActive} readOnly />
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  async function deleteStore(id: string, status: boolean) {
    await jsonRequest(STORE_EDIT.replace(':id', id), {
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
        loaderLineItems={3}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Store
          </Button>
        }]}
      />

      <CreateStore addModal={modal} onClose={() => {
        setModal(false);
        setOperation('create');
        fetchData();
        setStore(undefined);
      }} operation={operation} entity={store}/>
    </>
  );
};
