import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";
import {ProductVariant} from "./product.variant";

export interface PurchaseOrderItem extends HydraId, HydraType {
  id: number;
  item: Product;
  quantity: string;
  price: string;
  unit?: string;
  comments?: string;
  variants: PurchaseOrderItemVariant[];
}

export interface PurchaseOrderItemVariant extends HydraId, HydraType {
  id: number;
  quantity: string;
  variant: ProductVariant;
  purchasePrice: string;
  purchaseUnit?: string;
  comments?: string;
}
