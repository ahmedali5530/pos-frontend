import React, { FC, PropsWithChildren, useMemo, useState } from "react";
import { Button } from "../../../../app-common/components/input/button";
import { Modal } from "../../../../app-common/components/modal/modal";
import { withCurrency } from "../../../../lib/currency/currency";
import { PurchaseReturn, PurchaseReturnItem } from "../../../../api/model/purchase_return";
import { PrintService } from "../../print";

interface ViewPurchaseReturnProps extends PropsWithChildren {
  purchaseReturn: PurchaseReturn;
}

export const ViewPurchaseReturn: FC<ViewPurchaseReturnProps> = ({
  purchaseReturn, children
}) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setModal(true)}>
        {children}
      </Button>

      <Modal shouldCloseOnOverlayClick open={modal} onClose={() => {
        setModal(false);
      }} title={`Purchase Return No. ${purchaseReturn.invoice_number}`}>
        <div className="float-right">
          {/*<Button type="button" variant="secondary" onClick={() => {*/}
          {/*  PrintService(*/}
          {/*    <PurchaseReturnTable purchaseReturn={purchaseReturn}/>*/}
          {/*  )*/}
          {/*}}>Print</Button>*/}
        </div>

        <PurchaseReturnTable purchaseReturn={purchaseReturn}/>
      </Modal>
    </>
  );
}

interface PurchaseReturnTableProps {
  purchaseReturn: PurchaseReturn;
}

const PurchaseReturnTable = ({
  purchaseReturn
}: PurchaseReturnTableProps) => {
  const itemsTotal = useMemo(() => {
    if (!purchaseReturn.items) return 0;
    
    const itemsCost = purchaseReturn.items.reduce((total, item) => {
      return total + (Number(item.price || 0) * Number(item.quantity));
    }, 0);
    
    const variantsCost = purchaseReturn.items.reduce((total, item) => {
      const variantTotal = item.variants?.reduce((vTotal, variant) => {
        return vTotal + (Number(variant.price || 0) * Number(variant.quantity));
      }, 0) || 0;
      return total + variantTotal;
    }, 0);
    
    return itemsCost + variantsCost;
  }, [purchaseReturn]);

  const itemsQuantity = useMemo(() => {
    if (!purchaseReturn.items) return 0;
    
    const itemsQty = purchaseReturn.items.reduce((total, item) => {
      return total + Number(item.quantity);
    }, 0);
    
    const variantsQty = purchaseReturn.items.reduce((total, item) => {
      const variantQty = item.variants?.reduce((vTotal, variant) => {
        return vTotal + Number(variant.quantity);
      }, 0) || 0;
      return total + variantQty;
    }, 0);
    
    return itemsQty + variantsQty;
  }, [purchaseReturn]);

  const variantsTotal = (variants: PurchaseReturnItem['variants']) => {
    if (!variants) return 0;
    return variants.reduce((total, variant) => {
      return total + (Number(variant.price || 0) * Number(variant.quantity));
    }, 0);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-5 print:hidden">
        <div className="border border-gray-500 p-5 rounded">
          <div className="text-2xl">{itemsQuantity}</div>
          Total Quantity
        </div>
        <div className="border border-success-500 p-5 text-success-500 rounded font-bold">
          <div className="text-2xl">={withCurrency(itemsTotal)}</div>
          Return Total
        </div>
        <div className="border border-primary-500 p-5 text-primary-500 rounded">
          <div className="text-2xl">Purchase Info</div>
          <ul className="font-normal">
            <li>Purchase No: <span className="float-right">{purchaseReturn.purchase?.purchase_number || 'N/A'}</span></li>
            <li>Store: <span className="float-right">{purchaseReturn.store?.name || 'N/A'}</span></li>
          </ul>
        </div>
      </div>
      <table className="table border table-fixed">
        <thead>
        <tr>
          <th className="text-left">Item</th>
          <th className="text-right">Purchased Qty</th>
          <th className="text-right">Return Qty</th>
          <th className="text-right">Price</th>
          <th className="text-center">Comments</th>
          <th className="text-right">Total</th>
        </tr>
        </thead>
        <tbody>
        {purchaseReturn.items?.map((item, index) => (
          <React.Fragment key={index}>
            <tr className="hover:bg-gray-100">
              <td>{item.item.name}</td>
              <td className="text-right">{item.purchased || item.purchase_item?.quantity || 'N/A'}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{withCurrency(item.price || 0)}</td>
              <td className="text-center">{item.comments || '-'}</td>
              <td className="text-right">{withCurrency(Number(item.price || 0) * Number(item.quantity))}</td>
            </tr>
            {item.variants && item.variants.length > 0 && (
              <tr>
                <td colSpan={6} className="p-0">
                  <div className="bg-gray-50 p-3 m-3 rounded">
                    <table className="table table-fixed bg-white">
                      <thead>
                        <tr>
                          <th className="text-left">Variant</th>
                          <th className="text-right">Purchased Qty</th>
                          <th className="text-right">Return Qty</th>
                          <th className="text-right">Price</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.variants.map((variant, variantIndex) => (
                          <tr key={variantIndex} className="hover:bg-gray-100">
                            <td>{variant.variant?.attribute_value || 'N/A'}</td>
                            <td className="text-right">{variant.purchased || 'N/A'}</td>
                            <td className="text-right">{variant.quantity}</td>
                            <td className="text-right">{withCurrency(variant.price || 0)}</td>
                            <td className="text-right">{withCurrency(Number(variant.price || 0) * Number(variant.quantity))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan={4} className="text-left">Variant Total</th>
                          <th className="text-right">{withCurrency(variantsTotal(item.variants))}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
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
