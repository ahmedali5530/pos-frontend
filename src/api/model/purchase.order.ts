import {HydraId, HydraType} from "./hydra";
import {Supplier} from "./supplier";
import {PurchaseOrderItem} from "./purchase.order.item";
import {Store} from "./store";

export interface PurchaseOrder  {
  id: string;
  createdAt: string;
  supplier?: Supplier;
  items: PurchaseOrderItem[];
  store?: Store;
  poNumber?: string;
  isUsed?: boolean;
}
