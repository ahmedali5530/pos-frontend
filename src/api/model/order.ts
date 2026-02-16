import { User } from "./user";
import { OrderPayment } from "./order.payment";
import { Customer } from "./customer";
import { OrderItem } from "./order.item";
import { OrderDiscount } from "./order.discount";
import { OrderTax } from "./order.tax";
import { Store } from "./store";
import { Terminal } from "./terminal";
import { HydraId, HydraType } from "./hydra";

export interface Order  {
  id: string;
  order_id?: string;
  customer?: Customer;
  is_suspended?: boolean;
  is_deleted?: boolean;
  is_returned?: boolean;
  is_dispatched?: boolean;
  user?: User;
  items: OrderItem[];
  discount?: OrderDiscount;
  tax?: OrderTax;
  payments: OrderPayment[];
  created_at: Date;
  status: string;
  returned_from?: Pick<Order, "id" | "orderId" | "created_at">;
  notes?: string;
  store: Store;
  terminal: Terminal;
  // item_taxes: number;
  adjustment?: number;
}

export enum OrderStatus {
  COMPLETED = "Completed",
  ON_HOLD = "On Hold",
  DELETED = "Deleted",
  DISPATCHED = "Dispatched",
  PENDING = "Pending",
  RETURNED = "Returned",
}

export const ORDER_FETCHES = [
  'customer', 'customer.orders', 'customer.payments',
  'discount', 'discount.type',
  'items', 'items.product', 'items.taxes', 'items.variant',
  'payments', 'payments.type',
  'store',
  'returned_from',
  'tax', 'tax.type',
  'terminal',
  'user'
];