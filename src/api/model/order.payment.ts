import {PaymentType} from "./payment.type";
import {HydraId, HydraType} from "./hydra";

export interface OrderPayment extends HydraId, HydraType {
  total: number;
  received: number;
  due: number;
  type?: PaymentType;
}
