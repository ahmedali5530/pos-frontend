import {Store} from "./store";

export interface User {
  username: string;
  displayName: string;
  id: number;
  email: string;
  roles: string[];
  stores: Store[];
}
