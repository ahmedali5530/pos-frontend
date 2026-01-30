import {HydraId, HydraType} from "./hydra";

export interface Device  {
  id: string;
  name: string;
  ipAddress: string;
  port: string;
  prints: number;
}
