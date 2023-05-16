import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";

export interface PurchaseItem extends HydraId, HydraType {
  id: number;
  item: Product;
  quantity: string;
  purchasePrice: string;
  purchaseUnit?: string;
  barcode?: string;
  comments?: string;
}
