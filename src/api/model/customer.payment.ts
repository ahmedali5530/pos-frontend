import {Order} from "./order";

export interface CustomerPayment {
  id: string;
  amount: number;
  description: string;
  order?: Omit<Order, "customer"|"payments">;
  createdAt: string;
}
