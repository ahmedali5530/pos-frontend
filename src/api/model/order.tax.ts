import {Tax} from "./tax";
import {HydraId, HydraType} from "./hydra";

export interface OrderTax extends HydraId, HydraType {
  id: string;
  rate?: number;
  amount?: number;
  type?: Tax;
}
