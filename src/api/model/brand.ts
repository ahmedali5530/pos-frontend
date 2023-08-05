import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Brand extends HydraId, HydraType{
  id: string;
  name: string;
  stores: Store[];
  isActive: boolean;
}
