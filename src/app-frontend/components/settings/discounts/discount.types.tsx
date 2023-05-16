import React, {useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {DISCOUNT_LIST,} from "../../../../api/routing/routes/backend.app";
import {useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Discount} from "../../../../api/model/discount";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateDiscount} from "./create.discount";

export const DiscountTypes = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Discount>(DISCOUNT_LIST);
  const {fetchData} = useLoadHook;
  const store = useSelector(getStore);
  const [discount, setDiscount] = useState<Discount>();
  const [modal, setModal] = useState(false);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Discount>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('rate', {
      header: () => t('Rate'),
    }),
    columnHelper.accessor('rateType', {
      header: () => t('Rate Type'),
    }),
    columnHelper.accessor('scope', {
      header: () => t('Discount type'),
    }),
    columnHelper.accessor('stores', {
      header: () => t('Stores'),
      enableSorting: false,
      cell: (info) => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('id', {
      header: () => t('Actions'),
      enableSorting: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setDiscount(info.row.original);
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
        loaderLineItems={6}
        buttons={[{
          html: <Button variant="primary" onClick={() => {
            setModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Store
          </Button>
        }]}
      />

      <CreateDiscount addModal={modal} onClose={() => {
        setModal(false);
        setOperation('create');
        fetchData();
        setDiscount(undefined);
      }} operation={operation} entity={discount}/>
    </>
  );
};