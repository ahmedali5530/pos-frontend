import {User} from "./user";
import {Store} from "./store";
import {Terminal} from "./terminal";
import {HydraId, HydraType} from "./hydra";

export interface Closing extends HydraId, HydraType{
  id: string;
  dateFrom?: { datetime: string };
  dateTo?: { datetime: string };
  closedAt?: string;
  closedBy?: User;
  openingBalance?: number;
  closingBalance?: number;
  cashAdded?: number;
  cashWithdrawn?: number;
  openedBy?: User;
  data?: any;
  store: Store;
  denominations?: any;
  createdAt: {datetime: string};
  terminal: Terminal;
}
