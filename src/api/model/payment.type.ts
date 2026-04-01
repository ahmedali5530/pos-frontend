import {Store} from "./store";

export interface PaymentType  {
  id: string;
  name: string;
  type: string;
  can_have_change_due?: boolean;
  stores: Store[];
  is_active: boolean;
  priority: number
}
