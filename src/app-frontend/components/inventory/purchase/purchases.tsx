import React, {useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {PURCHASE_DELETE, PURCHASE_LIST} from "../../../../api/routing/routes/backend.app";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Purchase} from "../../../../api/model/purchase";
import {CreatePurchase as CreatePurchase} from "./create.purchase";
import {jsonRequest} from "../../../../api/request/request";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {withCurrency} from "../../../../lib/currency/currency";
import {DateTime} from "luxon";
import {ViewPurchase} from "./view.purchase";
import useApi from "../../../../api/hooks/use.api";
import {HydraCollection} from "../../../../api/model/hydra";

export const Purchases = () => {
  const [operation, setOperation] = useState('create');
  const [purchase, setPurchase] = useState<Purchase>();

  const useLoadHook = useApi<HydraCollection<Purchase>>('purchases', PURCHASE_LIST);

  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Purchase>();

  const columns: any = [
    columnHelper.accessor('purchaseNumber', {
      header: ('Purchase number'),
      cell: info => <ViewPurchase purchase={info.row.original}>
        <FontAwesomeIcon icon={faEye} className="mr-2" />
        {info.getValue()}
      </ViewPurchase>
    }),
    columnHelper.accessor('purchaseOrder.poNumber', {
      header: ('Purchase order'),
    }),
    columnHelper.accessor('supplier.name', {
      header: ('Supplier'),
    }),
    columnHelper.accessor('purchaseMode', {
      header: ('Purchase mode'),
      enableColumnFilter: false,
      enableSorting: false
    }),
    columnHelper.accessor('total', {
      header: ('Purchase total'),
      cell: info => withCurrency(info.getValue()),
      enableColumnFilter: false,
      enableSorting: false
    }),
    columnHelper.accessor('paymentType.name', {
      header: ('Payment type'),
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
    }),
    columnHelper.accessor('id', {
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
    await jsonRequest(PURCHASE_DELETE.replace(':id', id), {
      method: 'DELETE'
    });

    await useLoadHook.fetchData();
  }

  const [addModal, setAddModal] = useState(false);

  return (
    <>
      <TableComponent
        columns={columns}
        params={{
          store: store?.id
        }}
        loaderLineItems={10}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setAddModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Purchase
          </Button>
        }]}
        useLoadList={useLoadHook}
      />

      <CreatePurchase
        purchase={purchase}
        addModal={addModal}
        operation={operation}
        onClose={() => {
          setAddModal(false);
          useLoadHook.fetchData();
          setOperation('create');
        }}
      />
    </>
  );
}
