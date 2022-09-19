import {Store} from "./store";

export interface Supplier{
  id: string;
  name: string;
  phone?: string;
  email?: string;
  fax?: string;
  whatsApp?: string;
  address?: string;
  stores: Store[];
}
