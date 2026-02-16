import {HydraId, HydraType} from "./hydra";
import {Supplier} from "./supplier";
import {PurchaseOrderItem} from "./purchase.order.item";
import {Store} from "./store";

export interface PurchaseOrder  {
  id: string;
  created_at: Date;
  supplier?: Supplier;
  items: PurchaseOrderItem[];
  store?: Store;
  po_number?: string;
  is_used?: boolean;
}
