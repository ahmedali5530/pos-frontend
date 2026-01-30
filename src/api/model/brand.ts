import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Brand {
  id: string;
  name: string;
  stores: Store[];
  is_active: boolean;
}
