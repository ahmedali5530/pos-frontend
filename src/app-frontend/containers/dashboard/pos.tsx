import React, { useMemo } from "react";
import { DateTime } from "luxon";
import { Product } from "../../../api/model/product";
import { CartItem } from "../../../api/model/cart.item";
import { useAtom } from "jotai";
import { defaultData, PosModes } from "../../../store/jotai";
import { PosMode } from "../../components/modes/pos";
import { PaymentMode } from "../../components/modes/payment";
import { Discount, DiscountRate, DiscountScope } from "../../../api/model/discount";
import { Tax } from "../../../api/model/tax";

export const getRealProductPrice = (item: Product) => {
  let price = 0;

  if( !item ) return price;

  if( item.basePrice ) {
    price = item.basePrice;
  }

  if( item.prices.length > 0 ) {
    for ( let index in item.prices ) {
      const itemPrice = item.prices[index];

      if( !itemPrice.basePrice ) {
        continue;
      }

      //based on date
      if( itemPrice.date ) {
        if( DateTime.fromISO(itemPrice.date).toFormat('d') === DateTime.now().toFormat('d') ) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on time
      if( itemPrice.time && itemPrice.timeTo ) {
        if( DateTime.fromISO(itemPrice.time).toFormat('HH:mm') >= DateTime.now().toFormat('HH:mm') &&
          DateTime.fromISO(itemPrice.timeTo).toFormat('HH:mm') <= DateTime.now().toFormat('HH:mm') ) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on day
      if( itemPrice.day ) {
        if( itemPrice.day === DateTime.now().toFormat('cccc') ) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on week
      if( itemPrice.week ) {
        if( itemPrice.week === +DateTime.now().toFormat('W') ) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on month
      if( itemPrice.month ) {
        if( itemPrice.month === +DateTime.now().toFormat('L') ) {
          price = itemPrice.basePrice;
          break;
        }
      }

      //based on quarter
      if( itemPrice.quarter ) {
        if( itemPrice.quarter === +DateTime.now().toFormat('q') ) {
          price = itemPrice.basePrice;
          break;
        }
      }
    }
  }

  return price;
};

export const getExclusiveRowTotal = (item: CartItem) => {
  const quantity = parseFloat(item.quantity as unknown as string);

  let total = item.price * quantity;
  if( item.discount ) {
    total -= item.discount;
  }

  return total;
}

export const getRowTotal = (item: CartItem) => {
  const quantity = parseFloat(item.quantity as unknown as string);

  let total = item.price * quantity;
  if( item.discount ) {
    total -= item.discount;
  }

  //add taxes
  if( item.taxIncluded ) {
    total += item.taxes.reduce((prev, tax) => prev + (tax.rate * (item.price * quantity) / 100), 0);
  }

  return total;
};

export const subTotal = (added: CartItem[]) => {
  return added.reduce((prev, item) => prev + getRowTotal(item), 0);
}

export const exclusiveSubTotal = (added: CartItem[]) => {
  return added.reduce((prev, item) => prev + getExclusiveRowTotal(item), 0);
}

export const taxTotal = (added: CartItem[], tax?: Tax) => {
  if( !tax ) return 0;

  return (Number(tax.rate) * exclusiveSubTotal(added)) / 100;
}

export const discountTotal = (added: CartItem[], tax?: Tax, discountAmount?: number, discountRateType?: string, discount?: Discount ) => {
  if( discountAmount ) {
    //calculate based on open discount
    if( discountRateType ) {
      if( discountRateType === "fixed" ) {
        return discountAmount;
      } else {
        return ((subTotal(added) + taxTotal(added, tax)) * discountAmount) / 100;
      }
    }
    return discountAmount;
  }

  if( !discount ) return 0;

  if( discount.rateType === DiscountRate.RATE_FIXED && discount.rate ) {
    return discount.rate;
  } else if(
    discount.rateType === DiscountRate.RATE_PERCENT &&
    discount.rate
  ) {
    return ((subTotal(added) + taxTotal(added, tax)) * Number(discount?.rate)) / 100;
  } else {
    if( discount.scope === DiscountScope.SCOPE_EXACT && discount.rate ) {
      return discount.rate || 0;
    } else {
      //ask for discount
      return 0;
    }
  }
}

export const couponTotal = () => 0;

export const finalTotal = (added: CartItem[], tax?: Tax, discountAmount?: number, discountRateType?: string, discount?: Discount ) => {
  return subTotal(added) + taxTotal(added, tax) - discountTotal(added, tax, discountAmount, discountRateType, discount) - couponTotal();
}

export const scrollToBottom = (container: HTMLDivElement | null) => {
  container?.scrollTo(0, container?.scrollHeight * 2);
}



export const Pos = () => {
  const [defaultAppState, setDefaultAppState] = useAtom(defaultData);

  const { defaultMode } = defaultAppState;

  const modes: any = {
    [PosModes.pos]: <PosMode/>,
    [PosModes.order]: <PosMode/>,
    [PosModes.payment]: <PaymentMode/>,
  };

  return useMemo(() => {
    return modes[defaultMode ?? PosModes.pos]; // if nothing selected then default is POS mode
  }, [defaultMode]);
};
