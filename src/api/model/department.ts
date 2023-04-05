import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Department extends HydraId, HydraType {
  id: string;
  name: string;
  description?: string;
  uuid: string;
  createdAt: {datetime: string};
  updatedAt: {datetime: string};
  store?: Store;
}
