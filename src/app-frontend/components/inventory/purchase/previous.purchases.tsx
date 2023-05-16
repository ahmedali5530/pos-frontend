import React, {useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {PURCHASE_DELETE, PURCHASE_LIST} from "../../../../api/routing/routes/backend.app";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Purchase} from "../../../../api/model/purchase";
import {Purchase as CreatePurchase} from "./purchase";
import {Popconfirm} from 'antd';
import {jsonRequest} from "../../../../api/request/request";

export const PreviousPurchases = () => {
  const [operation, setOperation] = useState('create');
  const [purchase, setPurchase] = useState<Purchase>();

  const useLoadHook = useLoadList<Purchase>(PURCHASE_LIST);

  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Purchase>();

  const columns: any = [
    columnHelper.accessor('id', {
      header: () => t('ID'),
    }),
    columnHelper.accessor('purchaseNumber', {
      header: () => t('Purchase number'),
    }),
    columnHelper.accessor('purchaseOrder', {
      header: () => t('Purchase order'),
      cell: (info) => info.getValue()?.poNumber
    }),
    columnHelper.accessor('supplier', {
      header: () => t('Supplier'),
      cell: (info) => info.getValue()?.name
    }),
    columnHelper.accessor('createdAt', {
      header: () => t('Created at'),
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
            setPurchase(info.row.original);
            setAddModal(true);
          }} tabIndex={-1}>
            <FontAwesomeIcon icon={faPencilAlt}/>
          </Button>
          <span className="mx-2 text-gray-300">|</span>
          <Popconfirm
            placement="topRight"
            title="Confirm deletion"
            description="Are you sure to delete this purchase?"
            onConfirm={() => {
              deletePurchase(info.getValue().toString());
            }}
            okText="Yes, please"
            cancelText="No, wait"
            okType="danger"
          >
            <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
              <FontAwesomeIcon icon={faTrash}/>
            </Button>
          </Popconfirm>
        </>
      )
    }
  }));

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
        useLoadList={useLoadHook}
        params={{
          store: store?.id
        }}
        loaderLineItems={4}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setAddModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Purchase
          </Button>
        }]}
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
