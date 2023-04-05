import {HydraId, HydraType} from "./hydra";

export interface Media extends HydraId, HydraType{
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType?: string;
  extension?: string;
}
