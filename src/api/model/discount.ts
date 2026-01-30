import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Discount  {
  id: string;
  name: string;
  rate?: number;
  rate_type?: string;
  scope?: string;
  stores: Store[];
  is_active: boolean;
}

export enum DiscountRate {
  RATE_FIXED = 'fixed',
  RATE_PERCENT = 'percent'
}

export enum DiscountScope {
  SCOPE_OPEN = 'open',
  SCOPE_EXACT = 'exact'
}
