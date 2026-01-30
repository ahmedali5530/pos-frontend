import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Department  {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  store?: Store;
  is_active?: boolean
}
