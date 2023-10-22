import { atomWithStorage } from "jotai/utils";
import { Product } from "../api/model/product";
import { CartItem } from "../api/model/cart.item";
import { Coupon } from "../api/model/coupn";
import { PaymentType } from "../api/model/payment.type";
import { Discount } from "../api/model/discount";
import { Tax } from "../api/model/tax";
import { Customer } from "../api/model/customer";

export interface DefaultStateInterface {
  q: string;
  added: CartItem[];
  selected: number;
  selectedVariant: number;
  latest?: Product;
  latestIndex?: number;
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
}

export const defaultData = atomWithStorage<DefaultDataInterface>(
  "pos-default-data",
  {
    defaultTax: undefined,
    defaultDiscount: undefined,
    defaultPaymentType: undefined,
  }
);
