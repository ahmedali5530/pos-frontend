import {User} from "./user";
import {Store} from "./store";
import {Terminal} from "./terminal";
import {HydraId, HydraType} from "./hydra";

export interface Closing {
  id: string;
  date_from?: string;
  date_to?: string;
  closed_at?: string;
  closed_by?: User;
  opening_balance?: number;
  closing_balance?: number;
  cash_added?: number;
  cash_withdrawn?: number;
  opened_by?: User;
  data?: any;
  store: Store;
  denominations?: any;
  created_at: string;
  terminal: Terminal;
}
