import {HydraId, HydraType} from "./hydra";
import {Supplier} from "./supplier";
import {PurchaseOrderItem} from "./purchase.order.item";
import {Store} from "./store";

export interface PurchaseOrder extends HydraId, HydraType {
  id: number;
  createdAt: string;
  supplier?: Supplier;
  items: PurchaseOrderItem[];
  store?: Store;
  poNumber?: string;
  isUsed?: boolean;
}
