import {HydraId, HydraType} from "./hydra";

export interface ProductPrice  {
  id: string;
  date?: string;
  time?: string;
  time_to?: string;
  day?: string;
  week?: number;
  month?: number;
  quarter?: number;
  rate?: number;
  min_quantity?: number;
  max_quantity?: number;
  base_price?: number;
  base_quantity?: number;
}
