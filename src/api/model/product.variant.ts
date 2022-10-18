import {ProductPrice} from "./product.price";

export interface ProductVariant {
  id: number;
  name?: string;
  attributeName?: string;
  attributeValue?: string;
  barcode?: string;
  price?: number;
  prices?: ProductPrice[];
}
