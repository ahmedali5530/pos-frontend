import {Product} from "./product";
import {ProductVariant} from "./product.variant";

export interface CartItem {
  item: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
  discount?: number;
  tax?: number;
}