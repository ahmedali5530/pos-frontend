import React, {useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {STORE_LIST,} from "../../../../api/routing/routes/backend.app";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Store} from "../../../../api/model/store";
import {CreateStore} from "./create.store";

export const Stores = () => {
  const [operation, setOperation] = useState('create');
  const [store, setStore] = useState<Store>();
  const [modal, setModal] = useState(false);

  const useLoadHook = useLoadList<Store>(STORE_LIST);
  const {fetchData} = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Store>();

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('location', {
      header: () => t('Location'),
    }),
    columnHelper.accessor('id', {
      header: () => t('Actions'),
      enableSorting: false,
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
        loaderLineItems={6}
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
