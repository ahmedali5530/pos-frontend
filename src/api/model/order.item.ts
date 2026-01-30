import {Product} from "./product";
import {ProductVariant} from "./product.variant";
import {Tax} from "./tax";
import {HydraId, HydraType} from "./hydra";

export interface OrderItem  {
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
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemSimple  {
  id: string;
  product?: string;
  variant?: string;
  quantity: number;
  price: number;
  isSuspended?: boolean;
  isDeleted?: boolean;
  isReturned?: boolean;
  taxes: string[];
  taxesTotal: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
  order?: string;
}
