import React, {useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Purchase, PURCHASE_FETCHES} from "../../../../api/model/purchase";
import {CreatePurchase as CreatePurchase} from "./create.purchase";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {withCurrency} from "../../../../lib/currency/currency";
import {DateTime} from "luxon";
import {ViewPurchase} from "./view.purchase";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";
import {usePurchase} from "../../../../api/hooks/use.purchase";

export const Purchases = () => {
  const [operation, setOperation] = useState('create');
  const [purchase, setPurchase] = useState<Purchase>();
  const [{store}] = useAtom(appState);
  const db = useDB();

  const useLoadHook = useApi<SettingsData<Purchase>>(Tables.purchase, [`store = ${store?.id}`], [], 0, 10, PURCHASE_FETCHES);

  const columnHelper = createColumnHelper<Purchase>();
  const purchaseHook = usePurchase();

  const columns: any = [
    columnHelper.accessor('purchase_number', {
      header: ('Purchase number'),
      cell: info => <ViewPurchase purchase={info.row.original}>
        <FontAwesomeIcon icon={faEye} className="mr-2"/>
        {info.getValue()}
      </ViewPurchase>
    }),
    columnHelper.accessor('purchase_order.po_number', {
      header: ('Purchase order'),
    }),
    columnHelper.accessor('supplier.name', {
      header: ('Supplier'),
    }),
    columnHelper.accessor('purchase_mode', {
      header: ('Purchase mode'),
      enableColumnFilter: false,
      enableSorting: false
    }),
    columnHelper.accessor('id', {
      id: 'total',
      header: ('Purchase total'),
      cell: info => withCurrency(purchaseHook.calculatePurchaseTotal(info.row.original)),
      enableColumnFilter: false,
      enableSorting: false
    }),
    columnHelper.accessor('payment_type.name', {
      header: ('Payment type'),
    }),
    columnHelper.accessor('created_at', {
      header: 'Purchase time',
      cell: info => DateTime.fromJSDate(info.getValue()).toFormat(import.meta.env.VITE_DATE_TIME_HUMAN_FORMAT)
    }),
    columnHelper.accessor('store', {
      header: ('Store'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => info.getValue()?.name
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: ('Actions'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setOperation('update');
              setPurchase(info.row.original);
              setAddModal(true);
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deletePurchase(info.getValue().toString());
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirm deletion"
              description="Are you sure to delete this purchase?"
            >
              <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
                <FontAwesomeIcon icon={faTrash}/>
              </Button>
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  async function deletePurchase(id: string) {
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
        loaderLineItems={10}
        buttons={[
          <Button variant="primary" onClick={() => {
            setAddModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Purchase
          </Button>
        ]}
        loaderHook={useLoadHook}
      />

      {addModal && (
        <CreatePurchase
          purchase={purchase}
          addModal={addModal}
          operation={operation}
          onClose={() => {
            setAddModal(false);
            useLoadHook.fetchData();
            setOperation('create');
            setPurchase(undefined);
          }}
        />
      )}

    </>
  );
}
