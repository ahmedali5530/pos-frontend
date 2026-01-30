import {User} from "./user";
import {HydraId, HydraType} from "./hydra";

export interface Setting  {
  id: string;
  name: string;
  value?: string;
  description?: string;
  type?: string;
  user?: User;
}

export enum SettingTypes {
  TYPE_RECEIPT = 'sale_receipt'
}
