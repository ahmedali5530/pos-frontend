import {Discount} from "./discount";
import {HydraId, HydraType} from "./hydra";

export interface OrderDiscount  {
  id: string;
  rate?: number;
  amount?: number;
  type?: Discount;
}
