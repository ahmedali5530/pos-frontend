import {PaymentType} from "./payment.type";
import {HydraId, HydraType} from "./hydra";

export interface OrderPayment extends AddedPayment {
  id: string
}

export interface AddedPayment {
  total: number;
  received: number;
  due: number;
  type?: PaymentType;
}