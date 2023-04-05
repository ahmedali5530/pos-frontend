import {Store} from "./store";
import {HydraId, HydraType} from "./hydra";

export interface Discount extends HydraId, HydraType {
  id: number;
  name: string;
  rate?: number;
  rateType?: string;
  scope?: string;
  stores: Store[];
}

export enum DiscountRate {
  RATE_FIXED = 'fixed',
  RATE_PERCENT = 'percent'
}

export enum DiscountScope {
  SCOPE_OPEN = 'open',
  SCOPE_EXACT = 'exact'
}
