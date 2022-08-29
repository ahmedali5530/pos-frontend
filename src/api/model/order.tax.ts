import {Tax} from "./tax";

export interface OrderTax {
  id: string;
  rate?: number;
  amount?: number;
  type?: Tax;
}