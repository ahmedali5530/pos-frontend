import {HydraId, HydraType} from "./hydra";
import {Purchase} from "./purchase";

export interface SupplierPayment extends HydraId, HydraType{
  id: string;
  amount: number;
  description?: string;
  createdAt: string;
  purchase?: Omit<Purchase, "supplier">
}
