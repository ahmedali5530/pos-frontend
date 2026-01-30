import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface User  {
  username: string;
  display_name: string;
  id: string;
  email: string;
  roles: string[];
  stores: Store[];
  is_active: boolean
}
