import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Department  {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  store?: Store;
  is_active?: boolean
}
