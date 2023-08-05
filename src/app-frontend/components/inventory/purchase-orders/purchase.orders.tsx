import React, {useState} from "react";
import {
  PURCHASE_DELETE,
  PURCHASE_ORDER_DELETE,
  PURCHASE_ORDER_LIST
} from "../../../../api/routing/routes/backend.app";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {PurchaseOrder} from "../../../../api/model/purchase.order";
import {CreatePurchaseOrder} from "./create.purchase.order";
import useApi from "../../../../api/hooks/use.api";
import {HydraCollection} from "../../../../api/model/hydra";
import { DateTime } from "luxon";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { jsonRequest } from "../../../../api/request/request";

export const PurchaseOrders = () => {
  const [operation, setOperation] = useState('create');
  const store = useSelector(getStore);


  const useLoadHook = useApi<HydraCollection<PurchaseOrder>>('purchaseOrders', PURCHASE_ORDER_LIST, {
    store: store?.id
  });
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | undefined>();


  const {t} = useTranslation();

  const columnHelper = createColumnHelper<PurchaseOrder>();

  const columns: any = [
    columnHelper.accessor('poNumber', {
      header: ('PO Number'),
    }),
    columnHelper.accessor('supplier.name', {
      header: ('Supplier'),
    }),
    columnHelper.accessor('isUsed', {
      header: 'Status',
      cell: info => info.getValue() ? 'Used' : 'Open',
    }),
    columnHelper.accessor('createdAt', {
      header: ('Created at'),
      cell: info => DateTime.fromISO(info.getValue()).toFormat("yyyy-MM-dd")
    }),
    columnHelper.accessor('store', {
      header: ('Store'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => info.getValue()?.name
    })
  ];

  columns.push(columnHelper.accessor('id', {
    header: ('Actions'),
    enableSorting: false,
    enableColumnFilter: false,
    cell: (info) => {
      return (
        <>
          {!info.row.original.isUsed && (
            <>
              <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
                setOperation('update');
                setPurchaseOrder(info.row.original);
                setAddModal(true);
              }} tabIndex={-1}>
                <FontAwesomeIcon icon={faPencilAlt}/>
              </Button>
              <span className="mx-2 text-gray-300">|</span>
              <ConfirmAlert
                onConfirm={() => {
                  deletePurchaseOrder(info.getValue().toString());
                }}
                confirmText="Yes, please"
                cancelText="No, wait"
                title="Confirm deletion"
                description="Are you sure to delete this purchase order?"
              >
                <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
                  <FontAwesomeIcon icon={faTrash}/>
                </Button>
              </ConfirmAlert>
            </>
          )}
        </>
      )
    }
  }));

  async function deletePurchaseOrder(id: string) {
    await jsonRequest(PURCHASE_ORDER_DELETE.replace(':id', id), {
      method: 'DELETE'
    });

    await useLoadHook.fetchData();
  }

  const [addModal, setAddModal] = useState(false);

  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        loaderLineItems={5}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setAddModal(true);
            setPurchaseOrder(undefined);
            setOperation('create')
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Purchase order
          </Button>
        }]}
      />

      <CreatePurchaseOrder
        operation={operation}
        onClose={() => {
          setAddModal(false);
          useLoadHook.fetchData!();
          setOperation('create');
        }}
        showModal={addModal}
        purchaseOrder={purchaseOrder}
      />
    </>
  );
}
