import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Category {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  stores: Store[];
}
