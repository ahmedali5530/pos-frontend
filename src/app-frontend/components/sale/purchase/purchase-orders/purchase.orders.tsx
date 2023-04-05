import React, {useState} from "react";
import {useLoadList} from "../../../../../api/hooks/use.load.list";
import {PURCHASE_ORDER_LIST} from "../../../../../api/routing/routes/backend.app";
import {useSelector} from "react-redux";
import {getStore} from "../../../../../duck/store/store.selector";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../../app-common/components/table/table";
import {PurchaseOrder} from "../../../../../api/model/purchase.order";
import {Modal} from "../../../modal";
import {CreatePurchaseOrder} from "./create.purchase.order";

export const PurchaseOrders = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<PurchaseOrder>(PURCHASE_ORDER_LIST);
  const {fetchData} = useLoadHook;

  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<PurchaseOrder>();

  const columns: any = [
    columnHelper.accessor('id', {
      header: () => t('ID'),
    }),
    columnHelper.accessor('createdAt', {
      header: () => t('Phone'),
    }),
    columnHelper.accessor('store', {
      header: () => t('Store'),
      enableSorting: false,
      cell: (info) => info.getValue()?.name
    })
  ];

  columns.push(columnHelper.accessor('id', {
    header: () => t('Actions'),
    enableSorting: false,
    cell: (info) => {
      return (
        <>
          <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
            setOperation('update');
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
        loaderLineItems={4}
        buttons={[{
          html: <Button variant="primary" onClick={() => setAddModal(true)}>
            <FontAwesomeIcon icon={faPlus}/>
          </Button>,
          handler: () => {
          }
        }]}
      />

      <Modal
        open={addModal}
        size="full" title="Create purchase order"
        onClose={() => setAddModal(false)}
      >
        <CreatePurchaseOrder
          setOperation={setOperation}
          operation={operation}
          onClose={() => fetchData!()}
        />
      </Modal>
    </>
  );
}
