import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";
import {ProductVariant} from "./product.variant";

export interface PurchaseItem extends HydraId, HydraType {
  id: number;
  item: Product;
  quantity: string;
  quantityRequested?: string;
  purchasePrice: string;
  purchaseUnit?: string;
  barcode?: string;
  comments?: string;
  variants: PurchaseItemVariant[];
}

export interface PurchaseItemVariant extends HydraId, HydraType{
  id: number;
  variant: ProductVariant;
  quantity: string;
  quantityRequested?: string;
  purchasePrice: string;
  purchaseUnit?: string;
  barcode?: string;
  comments?: string;
}
