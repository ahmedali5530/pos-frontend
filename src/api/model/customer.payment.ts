import {Order} from "./order";

export interface CustomerPayment {
  id: string;
  amount: number;
  description: string;
  order?: Order;
  createdAt: string;
}