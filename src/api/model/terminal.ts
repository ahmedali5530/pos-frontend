import {Store} from "./store";
import {ReactSelectOptionProps} from "./common";

export interface Terminal {
  id: string;
  code: string;
  store?: Store;
  description?: string;
  uuid: string;
  createdAt: {datetime: string};
  updatedAt: {datetime: string};
  products: ReactSelectOptionProps[];
}
