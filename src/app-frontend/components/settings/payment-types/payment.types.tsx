import React, {useState} from "react";
import {PAYMENT_TYPE_LIST,} from "../../../../api/routing/routes/backend.app";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {PaymentType} from "../../../../api/model/payment.type";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";
import {getStore} from "../../../../duck/store/store.selector";
import {CreatePaymentType} from "./create.payment.type";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";

export const PaymentTypes = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useApi<HydraCollection<PaymentType>>('paymentTypes', PAYMENT_TYPE_LIST);
  const {fetchData} = useLoadHook;
  const user = useSelector(getAuthorizedUser);
  const store = useSelector(getStore);
  const [paymentType, setPaymentType] = useState<PaymentType>();
  const [modal, setModal] = useState(false);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<PaymentType>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: ('Name'),
    }),
    columnHelper.accessor('type', {
      header: ('Type'),
    }),
    columnHelper.accessor('canHaveChangeDue', {
      header: ('Can accept amount greater then total?'),
      cell: info => info.getValue() ? 'Yes' : 'No',
      enableColumnFilter: false,
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
              setPaymentType(info.row.original);
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
        params={{
          store: store?.id
        }}
        loaderLineItems={5}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Payment type
          </Button>
        }]}
      />

      <CreatePaymentType addModal={modal} onClose={() => {
        setPaymentType(undefined);
        setOperation('create');
        setModal(false);
        fetchData();
      }} entity={paymentType} operation={operation}/>
    </>
  );
};
