import React, {useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {PaymentType} from "../../../../api/model/payment.type";
import {CreatePaymentType} from "./create.payment.type";
import {Switch} from "../../../../app-common/components/input/switch";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";

export const PaymentTypes = () => {
  const [operation, setOperation] = useState("create");

  const [appSt] = useAtom(appState);
  const {user, store} = appSt;

  const db = useDB();

  const useLoadHook = useApi<SettingsData<PaymentType>>(
    Tables.payment,
    [`stores ?= ${store?.id}`],
    [], 0, 10, ['stores']
  );
  const {fetchData} = useLoadHook;
  const [paymentType, setPaymentType] = useState<PaymentType>();
  const [modal, setModal] = useState(false);

  const columnHelper = createColumnHelper<PaymentType>();

  const columns: any = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("type", {
      header: "Type",
    }),
    columnHelper.accessor("canHaveChangeDue", {
      header: "Can accept amount greater then total?",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("stores", {
      header: "Stores",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) =>
        info
          .getValue()
          .map((item) => item.name)
          .join(", "),
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button
              type="button"
              variant="primary"
              className="w-[40px]"
              onClick={() => {
                setPaymentType(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deletePaymentType(
                  info.getValue().toString(),
                  !info.row.original.is_active
                );
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${
                info.row.original.is_active ? "de-" : ""
              }activate this payment type?`}>
              <Switch checked={info.row.original.is_active} readOnly/>
            </ConfirmAlert>
          </>
        );
      },
    }),
  ];

  async function deletePaymentType(id: string, status: boolean) {
    await db.merge(new StringRecordId(id), {
      is_active: status,
    });

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        loaderLineItems={5}
        buttons={[
          <Button
            variant="primary"
            onClick={() => {
              setModal(true);
              setOperation("create");
            }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Payment type
          </Button>
        ]}
      />

      {modal && (
        <CreatePaymentType
          addModal={modal}
          onClose={() => {
            setPaymentType(undefined);
            setOperation("create");
            setModal(false);
            fetchData();
          }}
          entity={paymentType}
          operation={operation}
        />
      )}

    </>
  );
};
