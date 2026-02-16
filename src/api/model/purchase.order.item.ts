import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";
import {ProductVariant} from "./product.variant";

export interface PurchaseOrderItem  {
  id: string;
  item: Product;
  quantity: string;
  price: string;
  unit?: string;
  comments?: string;
  variants: PurchaseOrderItemVariant[];
}

export interface PurchaseOrderItemVariant  {
  id: string;
  quantity: string;
  variant: ProductVariant;
  purchase_price: string;
  purchase_unit?: string;
  comments?: string;
}
