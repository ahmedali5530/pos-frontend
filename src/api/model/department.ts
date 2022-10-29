import {Store} from "./store";

export interface Department {
  id: string;
  name: string;
  description?: string;
  uuid: string;
  createdAt: {datetime: string};
  updatedAt: {datetime: string};
  store?: Store;
}