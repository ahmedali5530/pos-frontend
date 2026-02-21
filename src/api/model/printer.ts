import {Store} from "./store";

export interface Printer{
  id: string
  name: string
  ip_address: string
  port: number
  prints: number
  type: string
  priority?: number
  store: Store
}
