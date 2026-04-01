import React, {FunctionComponent, useCallback, useEffect, useMemo,} from "react";
import {CartItem as CartItemModel} from "../../../api/model/cart.item";
import {CartItem} from "./cart.item";
import {Checkbox} from "../../../app-common/components/input/checkbox";
import Mousetrap from "mousetrap";
import {formatNumber, withCurrency} from "../../../lib/currency/currency";
import {useAtom} from "jotai";
import {defaultState} from "../../../store/jotai";
import {notify} from "../../../app-common/components/confirm/notification";
import {subTotal} from "../../containers/dashboard/pos";

interface CartContainerProps {

}

export enum CartItemType {
  quantity = "quantity",
  discount = "discount",
  rate = "rate",
}

export const CartContainer: FunctionComponent<CartContainerProps> = ({}) => {
  const [{added}, setAppState] = useAtom(defaultState);

  const onCheckAll = (e: any) => {
    setAppState((prev) => ({
      ...prev,
      added: prev.added.map(item => item.checked = e.target.checked),
    }));
  };

  const onCheck = (state: boolean, index: number) => {
    setAppState((prev) => ({
      ...prev,
      added: prev.added.map((item, idx) => {
        if(idx === index){
          item.checked = state;
        }

        return item;
      }),
    }));
  };

  const allChecked = useMemo(() => {
    return (
      added.length > 0 &&
      added.length === added.filter((item) => item.checked).length
    );
  }, [added]);

  const indeterminate = useMemo(() => {
    const checked = added.filter((item) => item.checked).length;
    const nonChecked = added.filter((item) => !item.checked).length;

    return (
      added.length > 0 &&
      checked > 0 &&
      nonChecked > 0 &&
      added.length !== checked
    );
  }, [added]);

  const onQuantityChange = (item: CartItemModel, newQuantity: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(
      (addItem) =>
        addItem.item.id === item.item.id && item.variant === addItem.variant
    );
    if (index !== -1) {
      if (newQuantity <= 0) {
        notify({
          type: "error",
          description: "Quantity cannot be less then 1",
        });
        return false;
      }

      oldItems[index].quantity = Number(newQuantity);
    }

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
    }));
  };

  const onPriceChange = (item: CartItemModel, newPrice: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(
      (addItem) =>
        addItem.item.id === item.item.id && item.variant === addItem.variant
    );
    if (index !== -1) {
      oldItems[index].price = newPrice;
    }

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
    }));
  };

  const onDiscountChange = (item: CartItemModel, newDiscount: number) => {
    const oldItems = [...added];
    let index = oldItems.findIndex(
      (addItem) =>
        addItem.item.id === item.item.id && item.variant === addItem.variant
    );

    //discount cannot exceed price
    const quantity = parseFloat(oldItems[index].quantity as unknown as string);

    if (newDiscount >= oldItems[index].price * quantity) {
      newDiscount = oldItems[index].price * quantity;
    }

    if (index !== -1) {
      oldItems[index].discount = newDiscount;
    }

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
    }));
  };

  const deleteItem = (index: number) => {
    const oldItems = [...added];

    oldItems.splice(index, 1);

    setAppState((prev) => ({
      ...prev,
      added: oldItems,
    }));
  };

  return (
    <div className="table w-full">
      <div className="table-header-group sticky top-0 z-10 bg-gray-200">
        <div className="table-row">
          <div className="table-cell p-2 w-[30px]">
            <Checkbox
              indeterminate={indeterminate}
              checked={allChecked}
              onChange={onCheckAll}
              tabIndex={-1}
              className="align-middle"
            />
          </div>
          <div className="table-cell p-2 text-left font-bold">Item</div>
          <div className="table-cell p-2 text-center font-bold w-[100px]">
            Stock
          </div>
          <div className="table-cell p-2 text-center font-bold w-[100px]">
            QTY
          </div>
          <div className="table-cell p-2 text-center font-bold w-[100px]">
            Disc.
          </div>
          <div className="table-cell p-2 text-center font-bold w-[100px]">
            Taxes
          </div>
          <div className="table-cell p-2 text-center font-bold w-[100px]">
            Rate
          </div>
          <div className="table-cell p-2 text-right font-bold w-[100px]">
            Total
          </div>
          {/*<div className="table-cell w-[80px]"/>*/}
        </div>
      </div>
      <div className="table-row-group">
        {added.map((item, index) => (
          <CartItem
            key={index}
            onQuantityChange={onQuantityChange}
            onDiscountChange={onDiscountChange}
            onPriceChange={onPriceChange}
            deleteItem={deleteItem}
            item={item}
            index={index}
            onCheck={onCheck}
          />
        ))}
      </div>
      <div className="table-footer-group">
        <div className="table-row font-bold">
          <div className="table-cell p-2">{added.length}</div>
          <div className="table-cell">items</div>
          <div className="table-cell"></div>
          <div className="table-cell text-center p-2">
            {formatNumber(added.reduce((previous, item) => {
              return parseFloat(item.quantity as unknown as string) + previous;
            }, 0))}
          </div>
          <div className="table-cell"></div>
          <div className="table-cell"></div>
          <div className="table-cell"></div>
          <div className="table-cell text-right p-2">
            {withCurrency(subTotal(added))}
          </div>
        </div>
      </div>
    </div>
  );
};
