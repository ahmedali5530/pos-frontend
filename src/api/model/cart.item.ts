import {Product} from "./product";
import {ProductVariant} from "./product.variant";
import {Tax} from "./tax";

export interface CartItem {
  item: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
  discount?: number;
  taxes: Tax[];
}
