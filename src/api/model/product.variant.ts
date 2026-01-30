import {ProductPrice} from "./product.price";
import {HydraId, HydraType} from "./hydra";
import {Store} from "./store";

export interface ProductVariant  {
  id: string;
  name?: string;
  attributeName?: string;
  attributeValue?: string;
  barcode?: string;
  price?: number;
  prices?: ProductPrice[];
  quantity?: number;
  stores: ProductVariantStore[]
}

export interface ProductVariantStore {
  id: string;
  store: Store
  quantity: number
  re_order_level?: number
  location?: string
}
