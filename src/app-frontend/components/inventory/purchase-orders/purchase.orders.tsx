import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {PurchaseOrder} from "../../../../api/model/purchase.order";
import {CreatePurchaseOrder} from "./create.purchase.order";
import {DateTime} from "luxon";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";

export const PurchaseOrders = () => {
  const [operation, setOperation] = useState('create');
  const [{store}] = useAtom(appState);


  const useLoadHook = useApi<SettingsData<PurchaseOrder>>(Tables.purchase_order, [`store = ${store?.id}`, 'and deleted_at = NULL OR deleted_at = NONE'], [], 0, 10, [
    'supplier', 'store', 'items', 'items.item', 'items.variants', 'items.variants.variant'
  ]);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | undefined>();

  const db = useDB();


  const {t} = useTranslation();

  const columnHelper = createColumnHelper<PurchaseOrder>();

  const columns: any = [
    columnHelper.accessor('po_number', {
      header: ('PO Number'),
    }),
    columnHelper.accessor('supplier.name', {
      header: ('Supplier'),
    }),
    columnHelper.accessor('is_used', {
      header: 'Status',
      cell: info => info.getValue() ? 'Used' : 'Open',
    }),
    columnHelper.accessor('created_at', {
      header: ('Created at'),
      cell: info => DateTime.fromJSDate(info.getValue()).toFormat(import.meta.env.VITE_DATE_TIME_HUMAN_FORMAT)
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
          {!info.row.original.is_used && (
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
    await db.merge(toRecordId(id), {
      deleted_at: DateTime.now().toJSDate()
    });

    await useLoadHook.fetchData();
  }

  const [addModal, setAddModal] = useState(false);

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        loaderLineItems={5}
        buttons={[
          <Button variant="primary" onClick={() => {
            setAddModal(true);
            setPurchaseOrder(undefined);
            setOperation('create')
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Purchase order
          </Button>
        ]}
      />

      {addModal && (
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
      )}
    </>
  );
}
