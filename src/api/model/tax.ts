import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Tax  {
  id: string;
  name: string;
  rate: number;
  stores: Store[];
  is_active: boolean;
}
