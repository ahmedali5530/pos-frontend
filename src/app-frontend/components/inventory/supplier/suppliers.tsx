import {useTranslation} from "react-i18next";
import {Button} from "../../../../app-common/components/input/button";
import React, {useState} from "react";
import {Supplier} from "../../../../api/model/supplier";
import {TableComponent} from "../../../../app-common/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {CreateSupplier} from "./create.supplier";
import {SupplierLedger} from "./supplier.ledger";
import {withCurrency} from "../../../../lib/currency/currency";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";
import {DateTime} from "luxon";

export const Suppliers = () => {
  const [operation, setOperation] = useState('create');

  const [{store}] = useAtom(appState);

  const useLoadHook = useApi<SettingsData<Supplier>>(Tables.supplier, [`stores ?= ${store?.id}`, ' and (deleted_at = NULL or deleted_at = NONE)'], [], 0, 10, [
    'stores', 'stores.store', 'payments', 'payments.payment_type', 'purchases'
  ])
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
    columnHelper.accessor('opening_balance', {
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

  const db = useDB();

  async function deleteSupplier(id: string) {
    await db.merge(toRecordId(id), {
      deleted_at: DateTime.now().toJSDate()
    });

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        loaderLineItems={6}
        buttons={[
          <Button variant="primary" onClick={() => {
            setModal(true);
            setSupplier(undefined);
            setOperation('create')
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Supplier
          </Button>
        ]}
      />

      {modal && (
        <CreateSupplier
          showModal={modal}
          supplier={supplier}
          operation={operation}
          onClose={() => {
            useLoadHook.fetchData();
            setSupplier(undefined);
            setModal(false);
            setOperation('create');
          }}
        />
      )}

    </>
  );
};
