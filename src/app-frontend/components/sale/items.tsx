import {Input} from "../input";
import {Loader} from "../../../app-common/components/loader/loader";
import Highlighter from "react-highlight-words";
import {Button} from "../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {Product} from "../../../api/model/product";
import {jsonRequest} from "../../../api/request/request";
import {PRODUCT_LIST} from "../../../api/routing/routes/backend.app";
import {TableComponent} from "../../../app-common/components/table/table";
import {useLoadList} from "../../../api/hooks/use.load.list";
import { useTranslation } from "react-i18next";
import {useAlert} from "react-alert";
import {createColumnHelper} from "@tanstack/react-table";

interface ItemsProps {
  setActiveTab: (tab: string) => void;
  setOperation: (operation: string) => void;
  setRow: (row: Product) => void;
}

export const Items = ({
  setActiveTab, setOperation, setRow
}: ItemsProps) => {
  const useLoadHook = useLoadList<Product>(PRODUCT_LIST);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('barcode', {
      header: () => t('Barcode'),
    }),
    columnHelper.accessor('basePrice', {
      header: () => t('Sale Price'),
    }),
    columnHelper.accessor('cost', {
      header: () => t('Purchase Price'),
    }),
    columnHelper.accessor('categories', {
      header: () => t('Categories'),
      cell: info => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('suppliers', {
      header: () => t('Suppliers'),
      cell: info => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('brands', {
      header: () => t('Brands'),
      cell: info => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('id', {
      header: () => t('Actions'),
      cell: (info) => {

        console.log(info)
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              // setRow(info);
              setOperation('update');
              setActiveTab('form');
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
      <TableComponent  columns={columns} useLoadList={useLoadHook} />
    </>
  );
};
