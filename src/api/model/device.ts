import {HydraId, HydraType} from "./hydra";

export interface Device  {
  id: string;
  name: string;
  ip_address: string;
  port: string;
  prints: number;
}
