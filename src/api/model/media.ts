import {HydraId, HydraType} from "./hydra";

export interface Media {
  id: string;
  name: string;
  original_name: string;
  size: number;
  mime_type?: string;
  extension?: string;
}
