import { HydraId, HydraType } from "./hydra";
import { Product } from "./product";
import { ProductVariant } from "./product.variant";

export interface Barcode {
  id: string;
  barcode: string;
  item: Product;
  variant?: ProductVariant;
  measurement: string;
  unit?: string;
  price?: string;
}
