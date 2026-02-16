import {Purchase} from "../model/purchase";

export const usePurchase = () => {
  const calculatePurchaseTotal = (purchase: Purchase) => {
    const itemsCost = purchase.items.reduce((prev: number, item: any) => prev + (parseFloat(item.purchase_price) * parseFloat(item.quantity)), 0);
    const variantsCost = purchase.items.reduce((p: number, i: any) => (
      i.variants.reduce((prev: number, variant: any) => prev + (Number(variant.purchase_price) * Number(variant.quantity)), 0)
    ), 0);

    return itemsCost + variantsCost;
  }

  return {
    calculatePurchaseTotal
  }
}