import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Expense  {
  id: string;
  description: string;
  amount: number;
  created_at: Date;
  store: Store;
}
