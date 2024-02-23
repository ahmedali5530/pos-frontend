import { atomWithStorage } from "jotai/utils";
import { Product } from "../api/model/product";
import { CartItem } from "../api/model/cart.item";
import { Coupon } from "../api/model/coupn";
import { PaymentType } from "../api/model/payment.type";
import { Discount } from "../api/model/discount";
import { Tax } from "../api/model/tax";
import { Customer } from "../api/model/customer";
import { ProductVariant } from "../api/model/product.variant";

export enum PosModes {
  pos = "pos",
  order = "order",
  payment = "payment",
}

export interface DefaultStateInterface {
  q: string;
  added: CartItem[];
  selected: number;
  selectedVariant: number;
  latest?: Product;
  latestVariant?: ProductVariant;
  latestIndex?: number;
  latestQuantity?: number;
  latestRate?: number;
  quantity: number;
  rate: number;
  discount?: Discount;
  discountAmount?: number;
  discountRateType?: string;
  tax?: Tax;
  coupon?: Coupon;
  customer?: Customer;
  refundingFrom?: number;
  adjustment: number;
  cartItem?: number;
  cartItemType: string;
  orderId?: string;
  customerName?: string;
  paymentType?: PaymentType
}

export const defaultState = atomWithStorage<DefaultStateInterface>(
  "pos-state",
  {
    q: "",
    added: [],
    selected: 0,
    selectedVariant: 0,
    quantity: 1,
    rate: 0,
    adjustment: 0,
    cartItemType: "quantity",
    tax: undefined,
  }
);

export interface DefaultDataInterface {
  defaultTax?: Tax;
  defaultDiscount?: Discount;
  defaultPaymentType?: PaymentType;
  enableShortcuts?: boolean;
  displayShortcuts?: boolean;
  enableTouch?: boolean;
  defaultMode?: PosModes;
  searchBox?: boolean;
  customerBox?: boolean;
  requireCustomerBox?: boolean;
}

export const defaultData = atomWithStorage<DefaultDataInterface>(
  "pos-default-data",
  {
    defaultTax: undefined,
    defaultDiscount: undefined,
    defaultPaymentType: undefined,
    enableShortcuts: true,
    displayShortcuts: false,
    enableTouch: false,
    defaultMode: PosModes.pos,
    searchBox: true,
    customerBox: true,
    requireCustomerBox: false
  }
);
