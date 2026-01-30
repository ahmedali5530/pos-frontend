import {PaymentType} from "./payment.type";
import {HydraId, HydraType} from "./hydra";

export interface OrderPayment  {
  total: number;
  received: number;
  due: number;
  type?: PaymentType;
}
