import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";
import {Purchase} from "./purchase";
import {PurchaseOrder} from "./purchase.order";
import {SupplierPayment} from "./supplier.payment";

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  fax?: string;
  whatsApp?: string;
  address?: string;
  stores: Store[];
  opening_balance?: number;
  payments?: SupplierPayment[];
  purchases?: Purchase[]
}
