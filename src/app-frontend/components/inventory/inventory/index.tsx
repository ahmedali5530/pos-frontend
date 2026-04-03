import {useDB} from "../../../../api/db/db";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Product} from "../../../../api/model/product";
import {Store} from "../../../../api/model/store";
import React, {useEffect, useMemo, useState} from "react";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import {ProductStore} from "../../../../api/model/product.store";
import {TableComponent} from "../../../../app-common/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {formatNumber} from "../../../../lib/currency/currency";
import {toRecordId} from "../../../../api/model/common";
import {Switch} from "../../../../app-common/components/input/switch";

export const InventoryDetails = () => {
  const db = useDB();
  const [{store: CurrentStore}] = useAtom(appState);

  const {data: products} = useApi<SettingsData<Product>>(Tables.product, [], [], 0, undefined, ['categories'], {}, ['id', 'name', 'categories']);
  const {data: stores} = useApi<SettingsData<Store>>(Tables.store, [], [], 0, undefined, [], {}, ['id', 'name']);

  const useLoadHook = useApi<SettingsData<ProductStore>>(Tables.product_store, [], [], 0, 10, [
    'store', 'variants.store', 'variants.variant', 'product', 'variants.product', 'product.categories'
  ], {}, ['id', 'product.name', 'product.categories', 'product.purchase_unit', 'quantity', 'store.name',
    '(SELECT product.name, product.purchase_unit, quantity, re_order_level, store.name, variant.attribute_value FROM product_variant_store WHERE product = $parent.product AND store = $parent.store) AS variants'
  ]);

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState<{label: string, value: string}|undefined>();
  const [store, setStore] = useState();
  const [zeroItems, setZeroItems] = useState(false);

  useEffect(() => {
    useLoadHook.resetFilters();

    if (store) {
      useLoadHook.addFilter(
        `store.id = ${toRecordId(store?.value)}`
      )
    }

    if (filteredProducts.length > 0) {
      useLoadHook.addFilter(
        `product.id IN [${filteredProducts.map(item => toRecordId(item.value)).join(',')}]`
      )
    }

    if(filteredCategory){
      useLoadHook.addFilter(
        `product.categories *= ${toRecordId(filteredCategory.value)}`
      )
    }

    if(zeroItems){
      useLoadHook.addFilter(
        `product_variant_store.quantity <= 0`
      )
    }else{
      useLoadHook.addFilter(
        `quantity > 0`
      )
    }

  }, [filteredProducts, store, filteredCategory, zeroItems]);

  const columnHelper = createColumnHelper();
  const columns: any = [
    columnHelper.accessor('store.name', {
      header: 'Store',
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('product.name', {
      header: 'Product',
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('product.categories', {
      header: 'Categories',
      enableSorting: false,
      enableColumnFilter: false,
      cell: info => info.getValue()?.map(item => item.name)?.join(', ')
    }),
    columnHelper.accessor('quantity', {
      header: 'Current Quantity',
      enableSorting: false,
      enableColumnFilter: false,
      cell: info => `${formatNumber(info.getValue())} ${info.row.original.product.purchase_unit}`
    }),
    columnHelper.accessor('re_order_level', {
      header: 'Re order level',
      enableSorting: false,
      enableColumnFilter: false,
      cell: info => info.getValue() ? `${formatNumber(info.getValue())} ${info.row.original.product.purchase_unit}` : '-'
    }),
    columnHelper.accessor('id', {
      header: 'Variants',
      enableSorting: false,
      enableColumnFilter: false,
      cell: info => {
        return (
          <table className="table table-borderless table-hover bg-white table-fixed w-[300px]">
            <tbody>
            {info.row.original.variants.map(item => (
              <tr>
                <td>{item.variant.attribute_value}</td>
                <td>{item.quantity} {info.row.original.product.purchase_unit}</td>
              </tr>
            ))}
            </tbody>
          </table>
        )
      }
    })
  ];

  const categories = useMemo(() => {
    const list = new Map();

    products?.data?.forEach(item => {
      item?.categories?.forEach(c => {
        list.set(c.id, {
          label: c.name,
          value: c.id
        })
      })
    });

    return Array.from(list.values());
  }, [products?.data]);

  return (
    <div>
      <div className="flex flex-row gap-5">
        <div className="flex-1">
          <label htmlFor="store">Store</label>
          <ReactSelect
            options={stores?.data?.map(item => ({
              label: item.name,
              value: item.id
            }))}
            value={store}
            onChange={setStore}
            isClearable
          />
        </div>
        <div className="flex-1">
          <label htmlFor="categories">Category</label>
          <ReactSelect
            options={categories}
            value={filteredCategory}
            isClearable
            onChange={(value) => {
              if(value) {
                setFilteredCategory(value);
              }else {
                setFilteredCategory(undefined);
              }
            }}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="products">Product</label>
          <ReactSelect
            options={products?.data?.map(item => ({
              label: item.name,
              value: item.id
            }))}
            value={filteredProducts}
            onChange={setFilteredProducts}
            isMulti
          />
        </div>
        <div className="flex-1 self-end">
          <Switch
            onChange={(e) => setZeroItems(e.currentTarget.checked)}
            checked={zeroItems}
            id="zero-items"
          >
            <label htmlFor="zero-items">Zero or less then zero items</label>
          </Switch>
        </div>
      </div>

      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        enableSearch={false}
        enableRefresh={false}
      />
    </div>
  )
}