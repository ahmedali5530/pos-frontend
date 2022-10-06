import {User} from "./user";
import {OrderPayment} from "./order.payment";
import {Customer} from "./customer";
import {OrderItem} from "./order.item";
import {OrderDiscount} from "./order.discount";
import {OrderTax} from "./order.tax";
import {Store} from "./store";
import {Terminal} from "./terminal";

export interface Order {
  id: string;
  orderId?: string;
  customer?: Customer;
  isSuspended?: boolean;
  isDeleted?: boolean;
  isReturned?: boolean;
  isDispatched?: boolean;
  user?: User;
  items: OrderItem[];
  discount?: OrderDiscount;
  tax?: OrderTax;
  payments: OrderPayment[];
  createdAt: string;
  status: string;
  returnedFrom?: Pick<Order, "id"|"orderId"|"createdAt">;
  notes?: string;
  store: Store;
  terminal: Terminal;
}

export enum OrderStatus{
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
  DELETED = 'Deleted',
  DISPATCHED = 'Dispatched'
}
