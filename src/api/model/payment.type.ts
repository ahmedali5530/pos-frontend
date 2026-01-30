import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface PaymentType  {
  id: string;
  name: string;
  type: string;
  can_have_change_due?: boolean;
  stores: Store[];
  is_active: boolean;
}
