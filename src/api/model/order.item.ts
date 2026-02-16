import {Product} from "./product";
import {ProductVariant} from "./product.variant";
import {Tax} from "./tax";
import {HydraId, HydraType} from "./hydra";
import {Order} from "./order";

export interface OrderItem  {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  is_suspended?: boolean;
  is_deleted?: boolean;
  is_returned?: boolean;
  taxes: Tax[];
  taxes_total: number;
  discount: number;
  created_at: string;
  updated_at: string;
  order?: Order
}

export interface OrderItemSimple  {
  id: string;
  product?: string;
  variant?: string;
  quantity: number;
  price: number;
  is_suspended?: boolean;
  is_deleted?: boolean;
  is_returned?: boolean;
  taxes: string[];
  taxes_total: number;
  discount: number;
  created_at: string;
  updated_at: string;
  order?: string;
}
