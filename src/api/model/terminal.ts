import {Store} from "./store";
import {ReactSelectOptionProps} from "./common";
import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";

export interface Terminal  {
  id: string;
  code: string;
  store?: Store;
  description?: string;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  products: Product[];
  is_active: boolean
}
