import {useTranslation} from "react-i18next";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import { PURCHASE_DELETE, SUPPLIER_EDIT, SUPPLIER_LIST } from "../../../../api/routing/routes/backend.app";
import {Supplier} from "../../../../api/model/supplier";
import {TableComponent} from "../../../../app-common/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {useSelector} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateSupplier} from "./create.supplier";
import {SupplierLedger} from "./supplier.ledger";
import useApi from "../../../../api/hooks/use.api";
import {HydraCollection} from "../../../../api/model/hydra";
import { withCurrency } from "../../../../lib/currency/currency";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { jsonRequest } from "../../../../api/request/request";

export const Suppliers = () => {
  const [operation, setOperation] = useState('create');

  const store = useSelector(getStore);
  const useLoadHook = useApi<HydraCollection<Supplier>>('suppliers', SUPPLIER_LIST, {
    store: store?.id
  })
  const [supplier, setSupplier] = useState<Supplier>();
  const [modal, setModal] = useState(false);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Supplier>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: ('Name'),
    }),
    columnHelper.accessor('phone', {
      header: ('Phone'),
    }),
    columnHelper.accessor('email', {
      header: ('Email'),
    }),
    columnHelper.accessor('openingBalance', {
      header: ('Opening balance'),
      cell: info => withCurrency(info.getValue())
    }),
    columnHelper.accessor('stores', {
      header: ('Stores'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('id', {
      header: ('Actions'),
      enableSorting: false,
      enableColumnFilter: false,
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
            <ConfirmAlert
              onConfirm={() => {
                deleteSupplier(info.getValue().toString());
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirm deletion"
              description={`Are you sure to delete ${info.row.original.name} with all purchases and purchase orders?`}
            >
            <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
              <FontAwesomeIcon icon={faTrash}/>
            </Button>
            </ConfirmAlert>
            <span className="mx-2 text-gray-300">|</span>
            <SupplierLedger supplier={info.row.original}/>
          </>
        )
      }
    })
  ];

  async function deleteSupplier(id: string) {
    await jsonRequest(SUPPLIER_EDIT.replace(':id', id), {
      method: 'DELETE'
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
