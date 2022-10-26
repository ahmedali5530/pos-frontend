import {Product} from "./product";
import {ProductVariant} from "./product.variant";
import {Tax} from "./tax";

export interface OrderItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  isSuspended?: boolean;
  isDeleted?: boolean;
  isReturned?: boolean;
  taxes: Tax[];
  taxesTotal: number;
}
