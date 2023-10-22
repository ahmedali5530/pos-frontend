import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { CartItem as CartItemModel } from "../../../api/model/cart.item";
import { Product } from "../../../api/model/product";
import { CartItem } from "./cart.item";
import { Checkbox } from "../../../app-common/components/input/checkbox";
import Mousetrap from "mousetrap";
import { withCurrency } from "../../../lib/currency/currency";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";

interface CartContainerProps {
  onQuantityChange: (item: CartItemModel, quantity: number) => void;
  onDiscountChange: (item: CartItemModel, discount: number) => void;
  onPriceChange: (item: CartItemModel, price: number) => void;
  deleteItem: (index: number) => void;
  subTotal: number;
  onCheckAll: (event: any) => void;
  onCheck: (state: boolean, index: number) => void;
}

export enum CartItemType {
  quantity = "quantity",
  discount = "discount",
  rate = "rate",
}

export const CartContainer: FunctionComponent<CartContainerProps> = ({
  onQuantityChange,
  onPriceChange,
  onDiscountChange,
  deleteItem,
  subTotal,
  onCheckAll,
  onCheck,
}) => {
  const [appState, setAppState] = useAtom(defaultState);
  const { added, cartItemType, cartItem } = appState;
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

  const updateCartItemType = useCallback(
    (direction: "left" | "right") => {
      if (cartItemType === CartItemType.quantity) {
        if (direction === "right") {
          setAppState((prev) => ({
            ...prev,
            cartItemType: CartItemType.discount,
          }));
        } else {
          setAppState((prev) => ({
            ...prev,
            cartItemType: CartItemType.discount,
          }));
        }
      }
      if (cartItemType === CartItemType.discount) {
        if (direction === "right") {
          setAppState((prev) => ({
            ...prev,
            cartItemType: CartItemType.quantity,
          }));
        } else {
          setAppState((prev) => ({
            ...prev,
            cartItemType: CartItemType.quantity,
          }));
        }
      }
    },
    [cartItemType]
  );

  const updateCartItem = useCallback(
    (direction: "up" | "down") => {
      const addedItems = added.length;
      let newCartItem = cartItem;
      if (!newCartItem) {
        newCartItem = 0;
      }

      if (direction === "up") {
        if (cartItem !== 0) {
          setAppState((prev) => ({
            ...prev,
            cartItem: Number(newCartItem) - 1,
          }));
        } else if (cartItem === 0) {
          setAppState((prev) => ({
            ...prev,
            cartItem: addedItems - 1,
          }));
        }
      }
      if (direction === "down") {
        if (newCartItem + 1 < addedItems) {
          setAppState((prev) => ({
            ...prev,
            cartItem: Number(newCartItem) + 1,
          }));
        } else if (newCartItem + 1 >= addedItems) {
          setAppState((prev) => ({
            ...prev,
            cartItem: 0,
          }));
        }
      }
    },
    [cartItem, added]
  );

  Mousetrap.bind(
    ["ctrl+up", "ctrl+down", "ctrl+left", "ctrl+right", "del"],
    function (e: KeyboardEvent) {
      e.preventDefault();
      if (!cartItem) {
        setAppState((prev) => ({
          ...prev,
          cartItem: 0,
        }));
      }

      if (e.code === "Delete") {
        setAppState((prev) => ({
          ...prev,
          added: added.filter((item, index) => index !== cartItem),
        }));
      }

      //update quantity of last added item
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        updateCartItemType(e.code === "ArrowLeft" ? "left" : "right");
      }

      if (e.code === "ArrowDown" || e.code === "ArrowUp") {
        updateCartItem(e.code === "ArrowDown" ? "down" : "up");
      }
    }
  );

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
          <div className="table-cell p-2 text-center font-bold w-[80px]">
            Stock
          </div>
          <div className="table-cell p-2 text-center font-bold w-[180px]">
            QTY
          </div>
          <div className="table-cell p-2 text-center font-bold w-[90px]">
            Disc.
          </div>
          <div className="table-cell p-2 text-center font-bold w-[90px]">
            Taxes
          </div>
          <div className="table-cell p-2 text-center font-bold w-[100px]">
            Rate
          </div>
          <div className="table-cell p-2 text-right font-bold w-[100px]">
            Total {withCurrency(undefined)}.
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
            {added.reduce((previous, item) => {
              return parseFloat(item.quantity as unknown as string) + previous;
            }, 0)}
          </div>
          <div className="table-cell"></div>
          <div className="table-cell"></div>
          <div className="table-cell"></div>
          <div className="table-cell text-right p-2">
            {withCurrency(subTotal)}
          </div>
        </div>
      </div>
    </div>
  );
};
