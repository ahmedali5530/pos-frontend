import {User} from "./user";
import {Terminal} from "./terminal";
import {Store} from "./store";

export interface Setting {
  id: string
  name: string
  values: any
  terminal?: Terminal
  store?: Store
  description?: string
}