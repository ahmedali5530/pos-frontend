import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import {Product} from "../../../../api/model/product";
import {PRODUCT_LIST} from "../../../../api/routing/routes/backend.app";
import {TableComponent} from "../../../../app-common/components/table/table";
import { useTranslation } from "react-i18next";
import { createColumnHelper} from "@tanstack/react-table";
import {ImportItems} from "./import.items";
import {ExportItems} from "./export.items";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";
import {getStore} from "../../../../duck/store/store.selector";
import {CreateItem} from "./items.create";
import useApi from "../../../../api/hooks/use.api";
import {HydraCollection} from "../../../../api/model/hydra";

export const Items = () => {
  const useLoadHook = useApi<HydraCollection<Product>>('products', PRODUCT_LIST);
  const [entity, setEntity] = useState<Product>();
  const user = useSelector(getAuthorizedUser);
  const store = useSelector(getStore);
  const [operation, setOperation] = useState('create');
  const [modal, setModal] = useState(false);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Product>();

  const columns: any[] = [
    columnHelper.accessor('department.name', {
      header: ('Department'),
    }),
    columnHelper.accessor('name', {
      header: ('Name'),
    }),
    columnHelper.accessor('barcode', {
      header: ('Barcode'),
    }),
    columnHelper.accessor('basePrice', {
      header: ('Sale Price'),
    }),
    columnHelper.accessor('cost', {
      header: ('Purchase Price'),
    }),
    columnHelper.accessor('categories', {
      id: 'categories.name',
      header: ('Categories'),
      cell: info => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('suppliers', {
      id: 'suppliers.name',
      header: ('Suppliers'),
      cell: info => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('brands', {
      id: 'brands.name',
      header: ('Brands'),
      cell: info => info.getValue().map(item => item.name).join(', ')
    }),
    columnHelper.accessor('variants', {
      header: ('Variants'),
      cell: info => `${info.getValue().length} variants`,
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('taxes', {
      id: 'taxes.name',
      header: ('Taxes'),
      cell: info => info.getValue().map(item => `${item.name} ${item.rate}%`).join(', ')
    }),
    columnHelper.accessor('stores', {
      header: ('Stores'),
      cell: info => info.getValue().map(item => item.name).join(', '),
      enableColumnFilter: false,
    }),
    columnHelper.accessor('id', {
      header: ('Actions'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setEntity(info.row.original);
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
        buttons={[
          {
            html: <ImportItems/>,
          },{
            html: <ExportItems/>,
          },
          {
            html: <Button variant="primary" onClick={() => {
              setModal(true);
              setOperation('create');
            }}>
              <FontAwesomeIcon icon={faPlus} className="mr-2"/> Item
            </Button>
          }
        ]}
        loaderLineItems={12}
        loaderLines={10}
      />

      <CreateItem addModal={modal} entity={entity} onClose={() => {
        setModal(false);
        setOperation('create');
        useLoadHook.fetchData();
        setEntity(undefined);
      }} operation={operation} />
    </>
  );
};
