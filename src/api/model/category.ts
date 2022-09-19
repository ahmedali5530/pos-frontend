import {Store} from "./store";

export interface Category {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  stores: Store[];
}
