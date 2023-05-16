import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";

export interface PurchaseOrderItem extends HydraId, HydraType {
  id: number;
  item: Product;
  quantity: string;
  price: string;
  unit?: string;
  comments?: string;
}
