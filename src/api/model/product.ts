import {Category} from "./category";
import {ProductVariant} from "./product.variant";
import {ProductPrice} from "./product.price";
import {Brand} from "./brand";
import {Supplier} from "./supplier";
import {Store} from "./store";
import {Department} from "./department";
import {Terminal} from "./terminal";
import {Tax} from "./tax";

export type Product = {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  baseQuantity?: number;
  isAvailable?: boolean;
  quantity?: number;
  basePrice: number;
  categories: Category[];
  variants: ProductVariant[];
  prices: ProductPrice[];
  isActive: boolean;
  uuid?: string;
  purchaseUnit?: string;
  saleUnit?: string;
  cost?: number;
  brands: Brand[];
  suppliers: Supplier[];
  stores: Store[];
  department?: Department;
  terminals: Terminal[];
  taxes: Tax[];
}
