import React, { FC, PropsWithChildren, useMemo, useState } from "react";
import { Purchase } from "../../../../api/model/purchase";
import { Button } from "../../../../app-common/components/input/button";
import { Modal } from "../../../../app-common/components/modal/modal";
import { withCurrency } from "../../../../lib/currency/currency";
import { PurchaseItemVariant } from "../../../../api/model/purchase.item";
import { PrintService } from "../../print";
import {usePurchase} from "../../../../api/hooks/use.purchase";

interface ViewPurchaseProps extends PropsWithChildren {
  purchase: Purchase;
}

export const ViewPurchase: FC<ViewPurchaseProps> = ({
  purchase, children
}) => {
  const [modal, setModal] = useState(false);


  return (
    <>
      <Button type="button" variant="primary" onClick={() => setModal(true)}>
        {children}
      </Button>

      <Modal shouldCloseOnOverlayClick open={modal} onClose={() => {
        setModal(false);
      }} title={`Purchase no. ${purchase.purchase_number}`}>
        <div className="float-right">
          <Button type="button" variant="secondary" onClick={() => {
            PrintService(
              <PurchaseTable purchase={purchase}/>
            )
          }}>Print</Button>
        </div>

        <PurchaseTable purchase={purchase}/>
      </Modal>
    </>
  );
}

interface PurchaseTableProps {
  purchase: Purchase;
}

const PurchaseTable = ({
  purchase
}: PurchaseTableProps) => {
  const itemsTotal = useMemo(() => {
    const iTotal = purchase.items.reduce((prev, item) => (
      (prev + (Number(item.quantity) * Number(item.purchase_price)))
    ), 0);

    const variantsTotal = purchase.items.reduce((prev, item) => (
      item.variants.reduce((p, v) => p + (Number(v.purchase_price) * Number(v.quantity)), 0)
    ), 0);

    return iTotal + variantsTotal;
  }, [purchase]);

  const itemsQuantity = useMemo(() => {
    const itemsQty = purchase.items.reduce((prev, item) => prev + (Number(item.quantity)), 0);
    const variantsQty = purchase.items.reduce((prev, item) => (
      item.variants.reduce((p, v) => p + Number(v.quantity), 0) + prev
    ), 0);

    return itemsQty + variantsQty;
  }, [purchase]);

  const variantsTotal = (variants: PurchaseItemVariant[]) => {
    return variants.reduce((prev, variant) => prev + (Number(variant.purchase_price) * Number(variant.quantity)), 0)
  };

  const purchaseTotal = useMemo(() => {
    return itemsTotal;
  }, [purchase, itemsTotal]);

  const totalRequested = useMemo(() => {
    const itemsQty = purchase.items.reduce((prev, item) => prev + Number(item.quantity_requested), 0);
    const variantsQty = purchase.items.reduce((prev, item) => (
      item.variants.reduce((p, v) => p + Number(v.quantity_requested), 0) + prev
    ), 0);

    return itemsQty + variantsQty;
  }, [purchase]);

  const purchaseHook = usePurchase();

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-5 print:hidden">
        <div className="border border-gray-500 p-5 rounded">
          <div className="text-2xl">+{withCurrency(itemsTotal)}</div>
          Items total
        </div>
        <div className="border border-success-500 p-5 text-success-500 rounded font-bold">
          <div className="text-2xl">={withCurrency(purchaseTotal)}</div>
          Total
        </div>
        <div className="border border-primary-500 p-5 text-primary-500 rounded">
          <div className="text-2xl">Payments</div>
          <ul className="font-normal">
            <li>{purchase?.payment_type?.name}: <span className="float-right">{withCurrency(purchaseHook.calculatePurchaseTotal(purchase))}</span></li>
          </ul>
        </div>
      </div>
      <table className="table border table-fixed">
        <thead>
        <tr>
          <th className="text-left">Item</th>
          <th className="text-left">Supplier</th>
          {purchase.purchase_order && (
            <th className="text-right">Quantity Requested</th>
          )}
          <th className="text-right">Quantity</th>
          <th className="text-right">Cost</th>
          <th className="text-center">Comments</th>
          <th className="text-right">Total</th>
        </tr>
        </thead>
        <tbody>
        {purchase.items.map((item, index) => (
          <React.Fragment key={index}>
            <tr className="hover:bg-gray-100">
              <td>{item.item.name}</td>
              <td>{item.supplier?.name || '-'}</td>
              {purchase.purchase_order && (
                <td className="text-right">{item.quantity_requested} {item.purchase_unit}</td>
              )}
              <td className="text-right">{item.quantity} {item.purchase_unit}</td>
              <td className="text-right">{withCurrency(item.purchase_price)}</td>
              <td className="text-center">{item.comments}</td>
              <td className="text-right">{withCurrency(Number(item.purchase_price) * Number(item.quantity))}</td>
            </tr>
            {item.variants.length > 0 && (
              <tr>
                <td colSpan={purchase.purchase_order ? 7 : 6} className="p-5 bg-gray-100">
                  <table className="table table-fixed bg-white">
                    <thead>
                    <tr>
                      <th>Variant</th>
                      {purchase.purchase_order && (
                        <th className={'text-right'}>Quantity requested</th>
                      )}
                      <th className={'text-right'}>Variant Quantity</th>
                      <th className={'text-right'}>Variant Cost</th>
                      <th className="text-center">Comments</th>
                      <th className={'text-right'}>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {item.variants.map(variant => (
                      <tr className="hover:bg-gray-100">
                        <td>{variant.variant.attribute_value}</td>
                        {purchase.purchase_order && (
                          <td className={'text-right'}>{variant.quantity_requested}</td>
                        )}
                        <td className={'text-right'}>{variant.quantity}</td>
                        <td className={'text-right'}>{withCurrency(variant.purchase_price)}</td>
                        <td className="text-center">{variant.comments}</td>
                        <td className={'text-right'}>{withCurrency(Number(variant.quantity) * Number(variant.purchase_price))}</td>
                      </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                      <th colSpan={purchase.purchase_order ? 5 : 4} className={'text-left'}>Total</th>
                      <th className={'text-right'}>{withCurrency(variantsTotal(item.variants))}</th>
                    </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
        </tbody>
        <tfoot>
        <tr>
          <th className="text-left">Total</th>
          <th></th>
          {purchase.purchase_order && (
            <th className="text-right">{totalRequested}</th>
          )}
          <th className="text-right">{itemsQuantity}</th>
          <th></th>
          <th></th>
          <th className="text-right">{withCurrency(itemsTotal)}</th>
        </tr>
        </tfoot>
      </table>
    </>
  )
}
