import {HydraId, HydraType} from "./hydra";
import {Purchase} from "./purchase";

export interface SupplierPayment {
  id: string;
  amount: number;
  description?: string;
  created_at: string;
  purchase?: Omit<Purchase, "supplier">
}
