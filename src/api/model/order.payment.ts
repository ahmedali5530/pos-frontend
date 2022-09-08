import {PaymentType} from "./payment.type";

export interface OrderPayment {
  total: number;
  received: number;
  due: number;
  type?: PaymentType;
}
