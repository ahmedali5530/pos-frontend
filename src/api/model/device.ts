import {HydraId, HydraType} from "./hydra";

export interface Device extends HydraId, HydraType {
  id: string;
  name: string;
  ipAddress: string;
  port: string;
  prints: number;
}
