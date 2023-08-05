import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface PaymentType extends HydraId, HydraType {
  id: string;
  name: string;
  type: string;
  canHaveChangeDue?: boolean;
  stores: Store[];
  isActive: boolean;
}
