import {User} from "./user";
import {OrderPayment} from "./order.payment";
import {Customer} from "./customer";
import {OrderItem} from "./order.item";
import {OrderDiscount} from "./order.discount";
import {OrderTax} from "./order.tax";

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
  returnedFrom?: Order;
  notes?: string;
}