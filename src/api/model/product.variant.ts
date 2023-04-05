import {ProductPrice} from "./product.price";
import {HydraId, HydraType} from "./hydra";

export interface ProductVariant extends HydraId, HydraType {
  id: number;
  name?: string;
  attributeName?: string;
  attributeValue?: string;
  barcode?: string;
  price?: number;
  prices?: ProductPrice[];
}
