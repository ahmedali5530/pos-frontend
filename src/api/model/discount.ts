import {Store} from "./store";

export interface Discount {
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
