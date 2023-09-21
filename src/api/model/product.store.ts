import { HydraId, HydraType } from "./hydra";
import { Store } from "./store";
import { Product } from "./product";

export interface ProductStore extends HydraId, HydraType {
  id: number;
  store: Store;
  product: Product;
  quantity: string;
  location?: string;
  reOrderLevel?: string;
}
