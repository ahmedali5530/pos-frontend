import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Tax extends HydraId, HydraType {
  id: number;
  name: string;
  rate: number;
  stores: Store[];
  isActive: boolean;
}
