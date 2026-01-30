import {Tax} from "./tax";
import {HydraId, HydraType} from "./hydra";

export interface OrderTax  {
  id: string;
  rate?: number;
  amount?: number;
  type?: Tax;
}
