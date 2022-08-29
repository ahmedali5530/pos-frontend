import {Product} from "./product";
import {ProductVariant} from "./product.variant";

export interface OrderItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  isSuspended?: boolean;
  isDeleted?: boolean;
  isReturned?: boolean;
}