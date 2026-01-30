import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";
import {ProductVariant} from "./product.variant";
import { Purchase } from "./purchase";

export interface PurchaseItem  {
  id: string;
  item: Product;
  quantity: string;
  quantityRequested?: string;
  purchasePrice: string;
  purchaseUnit?: string;
  barcode?: string;
  comments?: string;
  variants: PurchaseItemVariant[];
  createdAt: string;
  purchase: Pick<Purchase, "@id"|"createdAt">
}

export interface PurchaseItemVariant {
  id: string;
  variant: ProductVariant;
  quantity: string;
  quantityRequested?: string;
  purchasePrice: string;
  purchaseUnit?: string;
  barcode?: string;
  comments?: string;
}
