import {Order} from "./order";
import {HydraId, HydraType} from "./hydra";

export interface CustomerPayment extends HydraId, HydraType {
  id: string;
  amount: number;
  description: string;
  order?: Omit<Order, "customer"|"payments">;
  createdAt: string;
}
