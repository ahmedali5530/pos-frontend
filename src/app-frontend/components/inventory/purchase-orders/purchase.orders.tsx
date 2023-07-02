import React, {useState} from "react";
import {PURCHASE_ORDER_LIST} from "../../../../api/routing/routes/backend.app";
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

export const PurchaseOrders = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useApi<HydraCollection<PurchaseOrder>>('purchaseOrders', PURCHASE_ORDER_LIST);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | undefined>();

  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<PurchaseOrder>();

  const columns: any = [
    columnHelper.accessor('poNumber', {
      header: ('PO Number'),
    }),
    columnHelper.accessor('supplier.name', {
      header: ('Supplier'),
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
          <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
            setOperation('update');
            setPurchaseOrder(info.row.original);
            setAddModal(true);
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
  }));

  const [addModal, setAddModal] = useState(false);

  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        params={{
          store: store?.id
        }}
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
