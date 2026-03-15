import {User} from "./user";
import {Purchase} from "./purchase";
import {File} from "./file";
import {Product} from "./product";
import {PurchaseItem} from "./purchase.item";
import {Store} from "./store";
import {ProductVariant} from "./product.variant";

export interface InventoryWaste {
  id: string
  purchase?: Purchase
  created_at: Date
  created_by: User
  invoice_number: number
  items: InventoryWasteItem[]
  documents?: File[]
  store: Store
}

export interface InventoryWasteItem {
  id: string
  item: Product
  purchase_item?: PurchaseItem
  quantity: number
  comments?: string
  source?: string
  waste?: InventoryWaste
  variants?: InventoryWasteItemVariant[]
}

export interface InventoryWasteItemVariant {
  variant: ProductVariant
  quantity: number
}
