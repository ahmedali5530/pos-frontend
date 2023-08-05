import {Terminal} from "./terminal";
import {HydraId, HydraType} from "./hydra";

export interface Store extends HydraId, HydraType{
  id: string;
  name: string;
  location?: string;
  terminals: Terminal[];
  isActive: boolean
}
