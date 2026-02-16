import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";
import {ProductVariant} from "./product.variant";
import { Purchase } from "./purchase";

export interface PurchaseItem  {
  id: string;
  item: Product;
  quantity: string;
  quantity_requested?: string;
  purchase_price: string;
  purchase_unit?: string;
  barcode?: string;
  comments?: string;
  variants: PurchaseItemVariant[];
  created_at: string;
  purchase: Pick<Purchase, "@id"|"created_at">
}

export interface PurchaseItemVariant {
  id: string;
  variant: ProductVariant;
  quantity: string;
  quantity_requested?: string;
  purchase_price: string;
  purchase_unit?: string;
  barcode?: string;
  comments?: string;
}
