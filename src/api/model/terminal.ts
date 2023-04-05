import {Store} from "./store";
import {ReactSelectOptionProps} from "./common";
import {HydraId, HydraType} from "./hydra";
import {Product} from "./product";

export interface Terminal extends HydraId, HydraType {
  id: string;
  code: string;
  store?: Store;
  description?: string;
  uuid: string;
  createdAt: {datetime: string};
  updatedAt: {datetime: string};
  products: Product[];
}
