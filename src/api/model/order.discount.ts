import {Discount} from "./discount";
import {HydraId, HydraType} from "./hydra";

export interface OrderDiscount extends HydraId, HydraType {
  id: string;
  rate?: number;
  amount?: number;
  type?: Discount;
}
