import {Category} from "./category";
import {ProductVariant} from "./product.variant";
import {ProductPrice} from "./product.price";

export interface Product {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  baseQuantity?: number;
  isAvailable?: boolean;
  quantity?: number;
  basePrice: number;
  category: Category;
  variants: ProductVariant[];
  prices: ProductPrice[];
  isActive: boolean;
  uuid?: string;
  shortCode?: string;
  uom?: string;
  cost?: number;
}