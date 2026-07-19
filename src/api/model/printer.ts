import {Store} from "./store";

export type PrinterRole = 'receipt' | 'label';

export interface Printer{
  id: string
  name: string
  ip_address: string
  port: number
  prints: number
  type: string
  role?: PrinterRole | string
  priority?: number
  store: Store
  vid?: string
  pid?: string
  path?: string
}
