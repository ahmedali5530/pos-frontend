import { Button } from "../../../../app-common/components/input/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faPlus, faToggleOff, faTrash } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { Product } from "../../../../api/model/product";
import { PRODUCT_GET, PRODUCT_LIST } from "../../../../api/routing/routes/backend.app";
import { TableComponent } from "../../../../app-common/components/table/table";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table";
import { ImportItems } from "./import.items";
import { ExportItems } from "./export.items";
import { CreateItem } from "./items.create";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";
import { ConfirmAlert } from "../../../../app-common/components/confirm/confirm.alert";
import { jsonRequest } from "../../../../api/request/request";
import { Switch } from "../../../../app-common/components/input/switch";

export const Items = () => {
  const useLoadHook = useApi<HydraCollection<Product>>('products', PRODUCT_LIST);
  const [entity, setEntity] = useState<Product>();
  const [operation, setOperation] = useState('create');
  const [modal, setModal] = useState(false);

  const { t } = useTranslation();

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
      id: 'actions',
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
            <ConfirmAlert
              onConfirm={() => {
                deleteItem(info.getValue().toString(), !info.row.original.isActive);
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirm deletion"
              description={`Are you sure to ${info.row.original.isActive ? 'de-' : ''}activate this item?`}
            >
              <Switch checked={info.row.original.isActive} readOnly />
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  async function deleteItem(id: string, status: boolean) {
    await jsonRequest(PRODUCT_GET.replace(':id', id), {
      method: 'PUT',
      body: JSON.stringify({
        isActive: status
      })
    });

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
        buttons={[
          {
            html: <ImportItems/>,
          }, {
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
      }} operation={operation}/>
    </>
  );
};
