import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Supplier extends HydraId, HydraType{
  id: string;
  name: string;
  phone?: string;
  email?: string;
  fax?: string;
  whatsApp?: string;
  address?: string;
  stores: Store[];
  openingBalance?: number;
}
