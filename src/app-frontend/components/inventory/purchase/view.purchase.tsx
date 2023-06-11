import React, {FC, PropsWithChildren, useCallback, useMemo, useState} from "react";
import {Purchase} from "../../../../api/model/purchase";
import {Button} from "../../../../app-common/components/input/button";
import {Modal} from "../../../../app-common/components/modal/modal";
import {withCurrency} from "../../../../lib/currency/currency";
import {PurchaseItemVariant} from "../../../../api/model/purchase.item";

interface ViewPurchaseProps extends PropsWithChildren{
  purchase: Purchase;
}

export const ViewPurchase: FC<ViewPurchaseProps> = ({
 purchase, children
}) => {
  const [modal, setModal] = useState(false);

  const itemsTotal = useMemo(() => {
    const iTotal = purchase.items.reduce((prev, item) => (
      (prev + (Number(item.quantity) * Number(item.purchasePrice)))
    ), 0);

    const variantsTotal = purchase.items.reduce((prev, item) => (
      item.variants.reduce((p, v) => p + (Number(v.purchasePrice) * Number(v.quantity)), 0)
    ) , 0);

    return iTotal + variantsTotal;
  }, [purchase]);

  const itemsQuantity = useMemo(() => {
    const itemsQty = purchase.items.reduce((prev, item) => prev + (Number(item.quantity)), 0);
    const variantsQty = purchase.items.reduce((prev, item) => (
      item.variants.reduce((p, v) => p + Number(v.quantity), 0)
    ) , 0);

    return itemsQty + variantsQty;
  }, [purchase]);

  const variantsTotal = (variants: PurchaseItemVariant[]) => {
    return variants.reduce((prev, variant) => prev + (Number(variant.purchasePrice) * Number(variant.quantity)), 0)
  };

  const purchaseTotal = useMemo(() => {
    return itemsTotal;
  }, [purchase, itemsTotal]);

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setModal(true)}>
        {children}
      </Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title={`Purchase no. ${purchase.purchaseNumber}`}>
        <div className="grid grid-cols-4 gap-3 mb-5">
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
              <li>{purchase?.paymentType?.name}: <span className="float-right">{withCurrency(purchase.total)}</span></li>
            </ul>
          </div>
        </div>

        <table className="table border border-collapse table-fixed">
          <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-right">Quantity</th>
            <th className="text-right">Cost</th>
            <th>Comments</th>
            <th className="text-right">Total</th>
          </tr>
          </thead>
          <tbody>
          {purchase.items.map((item, index) => (
            <React.Fragment key={index}>
              <tr className="hover:bg-gray-100">
                <td>{item.item.name}</td>
                <td className="text-right">{item.quantity} {item.purchaseUnit}</td>
                <td className="text-right">{withCurrency(item.purchasePrice)}</td>
                <td>{item.comments}</td>
                <td className="text-right">{withCurrency(Number(item.purchasePrice) * Number(item.quantity))}</td>
              </tr>
              {item.variants.length > 0 && (
                <tr>
                  <td colSpan={5} className="p-5 bg-gray-100">
                    <table className="table border border-collapse table-fixed">
                      <thead>
                      <tr>
                        <th>Variant</th>
                        <th className={'text-right'}>Variant Quantity</th>
                        <th className={'text-right'}>Variant Cost</th>
                        <th>Comments</th>
                        <th className={'text-right'}>Total</th>
                      </tr>
                      </thead>
                      <tbody>
                      {item.variants.map(variant => (
                        <tr>
                          <td>{variant.variant.attributeValue}</td>
                          <td className={'text-right'}>{variant.quantity}</td>
                          <td className={'text-right'}>{withCurrency(variant.purchasePrice)}</td>
                          <td>{variant.comments}</td>
                          <td className={'text-right'}>{withCurrency(Number(variant.quantity) * Number(variant.purchasePrice))}</td>
                        </tr>
                      ))}
                      </tbody>
                      <tfoot>
                      <tr>
                        <th colSpan={4} className={'text-left'}>Total</th>
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
            <th className="text-right">{itemsQuantity}</th>
            <th></th>
            <th></th>
            <th className="text-right">{withCurrency(itemsTotal)}</th>
          </tr>
          </tfoot>
        </table>
      </Modal>
    </>
  );
}
