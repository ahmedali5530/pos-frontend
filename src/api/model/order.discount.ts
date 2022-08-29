import {Discount} from "./discount";

export interface OrderDiscount {
  id: string;
  rate?: number;
  amount?: number;
  type?: Discount;
}