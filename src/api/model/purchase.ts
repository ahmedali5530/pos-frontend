import {HydraId, HydraType} from "./hydra";
import {Supplier} from "./supplier";
import {Store} from "./store";
import {PurchaseItem} from "./purchase.item";
import {User} from "./user";
import {PurchaseOrder} from "./purchase.order";
import {PaymentType} from "./payment.type";

export interface Purchase extends HydraId, HydraType {
  id: number;
  createdAt: string;
  supplier?: Supplier;
  store: Store;
  items: PurchaseItem[];
  updateStocks?: boolean;
  updatePrice?: boolean;
  purchasedBy?: User;
  purchaseOrder?: PurchaseOrder;
  purchaseNumber?: number;
  purchaseMode?: string;
  paymentType?: PaymentType;
  total: number;
}
