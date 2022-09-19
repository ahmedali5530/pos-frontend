import {Store} from "./store";

export interface Tax {
  id: number;
  name: string;
  rate: number;
  stores: Store[];
}
