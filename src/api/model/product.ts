import {Category} from "./category";
import {ProductVariant} from "./product.variant";
import {ProductPrice} from "./product.price";
import {Brand} from "./brand";
import {Supplier} from "./supplier";
import {Store} from "./store";
import {Department} from "./department";
import {Terminal} from "./terminal";
import {Tax} from "./tax";
import {HydraId, HydraType} from "./hydra";
import { ProductStore } from "./product.store";
import {RecordId} from "surrealdb";

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  base_quantity?: number;
  is_available?: boolean;
  quantity?: number;
  base_price: number;
  categories: Category[];
  variants: ProductVariant[];
  prices: ProductPrice[];
  is_active: boolean;
  uuid?: string;
  purchase_unit?: string;
  sale_unit?: string;
  cost?: number;
  brands: Brand[];
  suppliers: Supplier[];
  stores: ProductStore[];
  department?: Department;
  terminals: Terminal[];
  taxes: Tax[];
  manage_inventory?: boolean
}

export interface SearchableProduct {
  isVariant?: boolean;
  variant?: ProductVariant;
  item: Product
}

export const ITEM_FETCHES = [
  'department', 'categories', 'suppliers', 'brands', 'variants', 'taxes', 'terminals', 'terminals.store',
  'stores', 'stores.store', 'variants.stores', 'variants.stores.store'
];