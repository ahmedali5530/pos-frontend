import {Order} from "./order";
import {CustomerPayment} from "./customer.payment";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  sale?: number;
  paid?: number;
  outstanding?: number;
  cnic?: string;
  payments: CustomerPayment[];
  orders: Omit<Order, "customer">[];
  openingBalance?: number;
}
