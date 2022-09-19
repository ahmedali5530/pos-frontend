import {Store} from "./store";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  store: Store;
}
