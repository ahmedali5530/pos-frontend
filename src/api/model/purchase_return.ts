import {Purchase} from "./purchase";
import {User} from "./user";
import {Store} from "./store";
import {File} from "./file";
import {Product} from "./product";
import {PurchaseItem, PurchaseItemVariant} from "./purchase.item";
import {Supplier} from "./supplier";

export interface PurchaseReturn {
  id: string
  purchase?: Purchase
  created_at: string
  created_by: User
  invoice_number: number
  items?: PurchaseReturnItem[]
  store?: Store
  documents?: File[]
}

export interface PurchaseReturnItem {
  id: string
  item: Product
  purchase_item?: PurchaseItem
  quantity: number
  purchased?: number
  price?: number
  comments?: string
  purchase_return?: PurchaseReturn
  store?: Store
  supplier?: Supplier
  variants?: PurchaseReturnItemVariant[]
}

export interface PurchaseReturnItemVariant {
  id: string
  variant: PurchaseItemVariant
  quantity: number
  purchased?: string
  price?: string
}