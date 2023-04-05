import {Product} from "./product";
import {ProductVariant} from "./product.variant";
import {Tax} from "./tax";
import {HydraId, HydraType} from "./hydra";

export interface CartItem extends HydraId, HydraType{
  item: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
  discount?: number;
  taxes: Tax[];
  checked?: boolean;
  void?: boolean;
  taxIncluded?: boolean;
  discountIncluded?: boolean;
}
