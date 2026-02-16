import {Order} from "./order";
import {CustomerPayment} from "./customer.payment";
import {HydraId, HydraType} from "./hydra";

export interface Customer  {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  sale?: number;
  paid?: number;
  outstanding: number;
  cnic?: string;
  payments: CustomerPayment[];
  orders: Omit<Order, "customer">[];
  opening_balance?: number;
  allow_credit_sale?: boolean;
  credit_limit?: string;
}

export const CUSTOMER_FETCHES = [
  'payments', 'payments.payment',
  'orders', 'orders.items', 'orders.items.variant', 'items.taxes', 'orders.items.taxes.tax', 'orders.payments',
  'orders.payments.type'
];

