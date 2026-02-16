import {ITEM_FETCHES, Product} from "../../../../api/model/product";
import React, {useState} from "react";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Tab, TabContent, TabControl, TabNav} from "../../../../app-common/components/tabs/tabs";
import {withCurrency} from "../../../../lib/currency/currency";
import {createColumnHelper} from "@tanstack/react-table";
import {OrderItem} from "../../../../api/model/order.item";
import {TableComponent} from "../../../../app-common/components/table/table";
import {HydraCollection} from "../../../../api/model/hydra";
import {PURCHASE_ITEM_LIST} from "../../../../api/routing/routes/backend.app";
import {DateTime} from "luxon";
import {DynamicValue} from "../../../../app-common/components/dynamic.value/dynamic.value";
import {PurchaseItem} from "../../../../api/model/purchase.item";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useOrder} from "../../../../api/hooks/use.order";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";
import {PURCHASE_FETCHES} from "../../../../api/model/purchase";

interface Props {
  product: Product;
  show?: boolean;
  onClose?: () => void;
}

export const ItemComponent = ({
  product, show, onClose
}: Props) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setModal(true)}>
        <FontAwesomeIcon icon={faEye}/>
      </Button>


      <Modal
        title={product.name}
        onClose={() => setModal(false)}
        shouldCloseOnEsc={true}
        open={modal}
      >
        {!!product && (
          <TabControl
            defaultTab="information"
            render={({isTabActive, setActiveTab}) => (
              <>
                <TabNav position={'top'}>
                  <Tab isActive={isTabActive('information')} onClick={() => setActiveTab('information')}>Item
                    Information</Tab>
                  <Tab isActive={isTabActive('stores')} onClick={() => setActiveTab('stores')}>Stores</Tab>
                  <Tab isActive={isTabActive('variants')} onClick={() => setActiveTab('variants')}>Variants</Tab>
                  <Tab isActive={isTabActive('sales')} onClick={() => setActiveTab('sales')}>Sales</Tab>
                  <Tab isActive={isTabActive('purchases')} onClick={() => setActiveTab('purchases')}>Purchases</Tab>
                </TabNav>
                <TabContent isActive={isTabActive('information')}>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <table className="table table-hover">
                        <tbody>
                        <tr>
                          <th className="text-right w-[200px]">Item name</th>
                          <td>{product.name}</td>
                        </tr>
                        <tr>
                          <th className="text-right w-[200px]">Barcode</th>
                          <td>{product.barcode}</td>
                        </tr>
                        <tr>
                          <th className="text-right w-[200px]">Sale Price</th>
                          <td>{withCurrency(product.base_price)} / {product.sale_unit}</td>
                        </tr>
                        <tr>
                          <th className="text-right w-[200px]">Purchase Price</th>
                          <td>{withCurrency(product.cost)} / {product.purchase_unit}</td>
                        </tr>
                        <tr>
                          <th className="text-right w-[200px]">Taxes</th>
                          <td>
                            {product.taxes.map(item => (
                              <span
                                className="badge bg-primary-100 p-3 rounded-full mr-2">{item.name} {item.rate}%</span>
                            ))}
                          </td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex-1">
                      <table className="table table-hover">
                        <tbody>
                        <tr>
                          <th className="text-right w-[200px]">Department</th>
                          <td>
                          <span
                            className="badge bg-primary-100 p-3 rounded-full mr-2">{product?.department?.name}</span>
                          </td>
                        </tr>
                        <tr>
                          <th className="text-right w-[200px]">Brands</th>
                          <td>{product.brands.map(item => (
                            <span className="badge bg-primary-100 p-3 rounded-full mr-2">{item.name}</span>
                          ))}</td>
                        </tr>
                        <tr>
                          <th className="text-right w-[200px]">Categories</th>
                          <td>{product.categories.map(item => (
                            <span className="badge bg-primary-100 p-3 rounded-full mr-2">{item.name}</span>
                          ))}</td>
                        </tr>
                        <tr>
                          <th className="text-right w-[200px]">Suppliers</th>
                          <td>{product.suppliers.map(item => (
                            <span className="badge bg-primary-100 p-3 rounded-full mr-2">{item.name}</span>
                          ))}</td>
                        </tr>
                        <tr>
                          <th className="text-right w-[200px]">Terminals</th>
                          <td>{product.terminals.map(item => (
                            <span className="badge bg-primary-100 p-3 rounded-full mr-2">{item.code}</span>
                          ))}</td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabContent>
                <TabContent isActive={isTabActive('variants')}>
                  <table className="table table-hover table-sm">
                    <thead>
                    <tr>
                      <th>Name</th>
                      <th>Barcode</th>
                      <th>Price</th>
                      <th>Stock remaining</th>
                    </tr>
                    </thead>
                    <tbody>
                    {product?.variants?.map(item => (
                      <tr>
                        <td>{item.attribute_value}</td>
                        <td>{item.barcode}</td>
                        <td>{item.price}</td>
                        <td>
                          <div>
                            <table className="table table-borderless table-sm table-hover bg-white">
                              <tbody>
                              {item?.stores?.map(s => (
                                <tr key={s.id}>
                                  <td className="text-left w-[50%]">{s.store.name}</td>
                                  <td className="text-left w-[50%]">{s.quantity}{product.sale_unit}</td>
                                </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </TabContent>
                <TabContent isActive={isTabActive('sales')}>
                  <ItemSales product={product}/>
                </TabContent>
                <TabContent isActive={isTabActive('purchases')}>
                  <ItemPurchases product={product}/>
                </TabContent>
                <TabContent isActive={isTabActive('stores')}>
                  <table className="table table-hover">
                    <thead>
                    <tr>
                      <th>Store</th>
                      <th>Stock</th>
                      <th>Location</th>
                      <th>Re Order Level</th>
                    </tr>
                    </thead>
                    <tbody>
                    {product.stores.map(store => (
                      <tr key={store.id}>
                        <td>{store.store.name}</td>
                        <td>{store.quantity}</td>
                        <td>{store.location}</td>
                        <td>{store.re_order_level}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </TabContent>
              </>
            )}
            position="top"
          />
        )}
      </Modal>
    </>
  )
}

interface ItemSaleProps {
  product: Product
}

export const ItemSales = ({
  product
}: ItemSaleProps) => {
  const useLoadHook = useApi<SettingsData<OrderItem>>(Tables.order_product, [`product = ${toRecordId(product.id)}`], ['created_at asc'], 0, 10, [
    'product', 'variant', 'order'
  ]);

  const orderHook = useOrder();

  const columnHelper = createColumnHelper<OrderItem>();
  const columns: any[] = [
    columnHelper.accessor('order.order_id', {
      header: 'Order#',
    }),
    columnHelper.accessor('variant.attribute_value', {
      header: 'Variant',
    }),
    columnHelper.accessor('created_at', {
      header: 'Ordered at',
      cell: info => DateTime.fromJSDate(info.getValue()).toFormat(import.meta.env.VITE_DATE_TIME_FORMAT)
    }),
    columnHelper.accessor('quantity', {
      header: 'Quantity'
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => withCurrency(info.getValue())
    }),
    columnHelper.accessor('discount', {
      header: 'Discount',
      cell: info => withCurrency(info.getValue()),
    }),
    columnHelper.accessor('id', {
      id: 'itemTaxes',
      header: 'Taxes',
      cell: info => withCurrency(orderHook.itemTaxes(info.row.original)),
      enableColumnFilter: false,
      enableSorting: false
    }),
    columnHelper.accessor('id', {
      id: 'total',
      header: 'Total',
      cell: info => withCurrency((info.row.original.price * info.row.original.quantity) - info.row.original.discount + orderHook.itemTaxes(info.row.original)),
      enableColumnFilter: false,
      enableSorting: false
    })
  ];

  return (
    <TableComponent
      columns={columns}
      loaderHook={useLoadHook}
      loaderLineItems={7}
      loaderLines={10}
    />
  )
}


interface ItemPurchaseProps {
  product: Product
}

export const ItemPurchases = ({
  product
}: ItemPurchaseProps) => {
  const useLoadHook = useApi<SettingsData<PurchaseItem>>(Tables.purchase_item, [`item = ${toRecordId(product.id)}`], [], 0, 10, ['item', 'purchase', 'variants']);

  const columnHelper = createColumnHelper<PurchaseItem>();
  const columns: any[] = [
    columnHelper.accessor('purchase.purchase_number', {
      id: 'purchase.purchaseNumber',
      header: 'Purchase#',
    }),
    columnHelper.accessor('created_at', {
      header: 'Created at',
      cell: info => DateTime.fromJSDate(info.getValue()).toFormat(import.meta.env.VITE_DATE_TIME_FORMAT)
    }),
    columnHelper.accessor('quantity_requested', {
      header: 'Quantity Requested'
    }),
    columnHelper.accessor('quantity', {
      header: 'Quantity'
    }),
    columnHelper.accessor('purchase_price', {
      header: 'Price',
      cell: info => withCurrency(info.getValue())
    }),
    columnHelper.accessor('id', {
      header: 'Total',
      cell: info => withCurrency((Number(info.row.original.purchase_price) * Number(info.row.original.quantity))),
      enableColumnFilter: false,
      enableSorting: false
    })
  ];

  return (
    <TableComponent
      columns={columns}
      loaderHook={useLoadHook}
      loaderLineItems={6}
      loaderLines={10}
    />
  )
}
