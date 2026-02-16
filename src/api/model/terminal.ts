import {Store} from "./store";
import {ReactSelectOptionProps} from "./common";
import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";
import {RecordId} from "surrealdb";

export interface Terminal  {
  id: RecordId;
  code: string;
  store?: Store;
  description?: string;
  uuid: string;
  created_at: string;
  updated_at: string;
  products: Product[];
  is_active: boolean
}
