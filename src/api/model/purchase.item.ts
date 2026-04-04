import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";
import {ProductVariant} from "./product.variant";
import { Purchase } from "./purchase";
import {Supplier} from "./supplier";

export interface PurchaseItem  {
  id: string;
  item: Product;
  quantity: number;
  quantity_requested?: number;
  purchase_price: number;
  purchase_unit?: string;
  barcode?: string;
  comments?: string;
  variants: PurchaseItemVariant[];
  created_at: Date;
  purchase?: Purchase
  supplier?: Supplier
}

export interface PurchaseItemVariant {
  id: string;
  variant: ProductVariant;
  quantity: number;
  quantity_requested?: number;
  purchase_price: number;
  purchase_unit?: string;
  barcode?: string;
  comments?: string;
}
