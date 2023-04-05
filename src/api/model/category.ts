import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Category extends HydraId, HydraType {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  stores: Store[];
}
