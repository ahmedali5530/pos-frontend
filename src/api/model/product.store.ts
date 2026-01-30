import { HydraId, HydraType } from "./hydra";
import { Store } from "./store";
import { Product } from "./product";

export interface ProductStore  {
  id: string;
  store: Store;
  product: Product;
  quantity: string;
  location?: string;
  re_order_level?: string;
}
