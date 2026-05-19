import {Product} from "../../api/model/product";
import {ProductVariant} from "../../api/model/product.variant";

export type CartInputMode = 'none' | 'weight' | 'price';

export const CART_INPUT_MODES: { label: string; value: CartInputMode }[] = [
  {label: 'None', value: 'none'},
  {label: 'Ask weight', value: 'weight'},
  {label: 'Ask price', value: 'price'},
];

export function getCartInputMode(product: Product): CartInputMode {
  const mode = product.cart_input_mode;
  if (mode === 'weight' || mode === 'price') {
    return mode;
  }
  return 'none';
}

export function shouldPromptCartInput(product: Product): boolean {
  const mode = getCartInputMode(product);
  return mode === 'weight' || mode === 'price';
}

export function canEditCartPrice(product: Product): boolean {
  return product.allow_price_change === true || product.variable_price === true;
}

export function usesVariablePriceEditor(product: Product): boolean {
  return product.variable_price === true;
}

export function canEditCartDiscount(product: Product): boolean {
  return product.allow_discount !== false;
}

export function getProductPriceBounds(product: Product): { min?: number; max?: number } {
  if (!product.variable_price) {
    return {};
  }
  return {
    min: product.price_min != null ? Number(product.price_min) : undefined,
    max: product.price_max != null ? Number(product.price_max) : undefined,
  };
}

export function validateProductPrice(product: Product, price: number): string | null {
  if (!product.variable_price) {
    return null;
  }
  const {min, max} = getProductPriceBounds(product);
  if (min != null && price < min) {
    return `Price must be at least ${min}`;
  }
  if (max != null && price > max) {
    return `Price must be at most ${max}`;
  }
  return null;
}

export function clampProductPrice(product: Product, price: number): number {
  if (!product.variable_price) {
    return price;
  }
  const {min, max} = getProductPriceBounds(product);
  let result = price;
  if (min != null && result < min) {
    result = min;
  }
  if (max != null && result > max) {
    result = max;
  }
  return result;
}

export function getDefaultUnitPrice(product: Product, variant?: ProductVariant): number {
  if (variant?.price != null) {
    return Number(variant.price);
  }
  return Number(product.base_price ?? 0);
}

export function computeWeightLinePrice(
  product: Product,
  quantity: number,
  variant?: ProductVariant
): number {
  return getDefaultUnitPrice(product, variant) * quantity;
}

/** Skip cart prompt when barcode/scan already supplied explicit values */
export function shouldSkipCartPrompt(
  product: Product,
  options?: { price?: number; fromBarcode?: boolean }
): boolean {
  if (options?.fromBarcode) {
    return true;
  }
  if (options?.price != null && getCartInputMode(product) !== 'weight') {
    return true;
  }
  return false;
}
