import {Store} from "./store";
import {Terminal} from "./terminal";
import {User} from "./user";

export interface AppConnection {
  id: string
  created_at: Date
  device?: string
  store?: Store
  terminal?: Terminal
  user?: User
}