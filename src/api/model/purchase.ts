import {HydraId, HydraType} from "./hydra";
import {Supplier} from "./supplier";
import {Store} from "./store";
import {PurchaseItem} from "./purchase.item";
import {User} from "./user";
import {PurchaseOrder} from "./purchase.order";
import {PaymentType} from "./payment.type";

export interface Purchase  {
  id: string;
  created_at: Date;
  supplier?: Supplier;
  store: Store;
  items: PurchaseItem[];
  update_stocks?: boolean;
  update_price?: boolean;
  purchased_by?: User;
  purchase_order?: PurchaseOrder;
  purchase_number?: number;
  purchase_mode?: string;
  payment_type?: PaymentType;
}

export const PURCHASE_FETCHES = [
  'purchase_order', 'store', 'supplier', 'payment_type', 'items', 'items.item', 'items.item.variants', 'items.variants', 'items.variants.variant'
];