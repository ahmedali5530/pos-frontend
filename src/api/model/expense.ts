import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Expense  {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  store: Store;
}
