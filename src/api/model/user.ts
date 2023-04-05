import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface User extends HydraId, HydraType {
  username: string;
  displayName: string;
  id: number;
  email: string;
  roles: string[];
  stores: Store[];
}
