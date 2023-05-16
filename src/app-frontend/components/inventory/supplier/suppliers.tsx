import {useTranslation} from "react-i18next";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {SUPPLIER_LIST} from "../../../../api/routing/routes/backend.app";
import {Supplier} from "../../../../api/model/supplier";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {createColumnHelper} from "@tanstack/react-table";
import {useSelector} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateSupplier} from "./create.supplier";

export const Suppliers = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Supplier>(SUPPLIER_LIST);
  const {fetchData} = useLoadHook;
  const [supplier, setSupplier] = useState<Supplier>();
  const [modal, setModal] = useState(false);

  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Supplier>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('phone', {
      header: () => t('Phone'),
    }),
    columnHelper.accessor('email', {
      header: () => t('Email'),
    }),
    columnHelper.accessor('openingBalance', {
      header: () => t('Opening balance'),
    })
  ];

  columns.push(columnHelper.accessor('stores', {
    header: () => t('Stores'),
    enableSorting: false,
    cell: (info) => info.getValue().map(item => item.name).join(', ')
  }));

  columns.push(columnHelper.accessor('id', {
    header: () => t('Actions'),
    enableSorting: false,
    cell: (info) => {
      return (
        <>
          <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
            setSupplier(info.row.original);
            setOperation('update');
            setModal(true);
          }} tabIndex={-1}>
            <FontAwesomeIcon icon={faPencilAlt}/>
          </Button>
          <span className="mx-2 text-gray-300">|</span>
          <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
            <FontAwesomeIcon icon={faTrash}/>
          </Button>
          <span className="mx-2 text-gray-300">|</span>
          <Button variant="secondary" type="button">Ledger</Button>
        </>
      )
    }
  }));


  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        params={{
          store: store?.id
        }}
        loaderLineItems={4}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setSupplier(undefined);
            setOperation('create')
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Supplier
          </Button>
        }]}
      />

      <CreateSupplier
        showModal={modal}
        supplier={supplier}
        operation={operation}
        onClose={() => {
          useLoadHook.fetchData();
          setSupplier(undefined);
          setModal(false);
          setOperation('create');
        }}/>
    </>
  );
};