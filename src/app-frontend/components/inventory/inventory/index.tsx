import {useDB} from "../../../../api/db/db";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Product} from "../../../../api/model/product";
import {Store} from "../../../../api/model/store";
import React, {useEffect, useState} from "react";
import {Button} from "../../../../app-common/components/input/button";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import {Purchase, PURCHASE_FETCHES} from "../../../../api/model/purchase";
import {ProductStore} from "../../../../api/model/product.store";
import {TableComponent} from "../../../../app-common/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {ViewPurchase} from "../purchase/view.purchase";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {formatNumber, withCurrency} from "../../../../lib/currency/currency";
import {DateTime} from "luxon";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {toRecordId} from "../../../../api/model/common";

export const InventoryDetails = () => {
  const db = useDB();
  const [{store: CurrentStore}] = useAtom(appState);

  const {data: products} = useApi<SettingsData<Product>>(Tables.product, [], [], 0, undefined, [], {}, ['id', 'name']);
  const {data: stores} = useApi<SettingsData<Store>>(Tables.store, [], [], 0, undefined, [], {}, ['id', 'name']);

  const useLoadHook = useApi<SettingsData<ProductStore>>(Tables.product_store, [], [], 0, 10, [
    'store', 'variants.store', 'variants.variant', 'product', 'variants.product'
  ], {}, ['id', 'product.name', 'product.purchase_unit', 'quantity', 'store.name',
    '(SELECT product.name, product.purchase_unit, quantity, store.name, variant.attribute_value FROM product_variant_store WHERE product = $parent.product AND store = $parent.store) AS variants'
  ]);

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [store, setStore] = useState();

  useEffect(() => {
    useLoadHook.resetFilters();

    if(store){
      useLoadHook.addFilter(
        `store.id = ${toRecordId(store?.value)}`
      )
    }

    if(filteredProducts.length > 0){
      useLoadHook.addFilter(
        `product.id IN [${filteredProducts.map(item => toRecordId(item.value)).join(',')}]`
      )
    }
  }, [filteredProducts, store]);

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
    columnHelper.accessor('product.purchase_unit', {
      header: 'Purchase unit',
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('quantity', {
      header: 'Quantity',
      enableSorting: false,
      enableColumnFilter: false,
      cell: info => formatNumber(info.getValue())
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
                <td>{item.quantity}</td>
              </tr>
            ))}
            </tbody>
          </table>
        )
      }
    })
  ];

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