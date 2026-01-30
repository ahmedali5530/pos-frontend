import {Terminal} from "./terminal";
import {HydraId, HydraType} from "./hydra";

export interface Store {
  id: string;
  name: string;
  location?: string;
  terminals: Terminal[];
  is_active: boolean
}
