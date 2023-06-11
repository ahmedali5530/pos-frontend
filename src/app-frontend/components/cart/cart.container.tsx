import React, {createRef, FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";
import {CartItem as CartItemModel} from "../../../api/model/cart.item";
import {Product} from "../../../api/model/product";
import {CartItem} from "./cart.item";
import {Checkbox} from "../../../app-common/components/input/checkbox";
import _ from "lodash";
const Mousetrap = require('mousetrap');

interface CartContainerProps {
  added: CartItemModel[];
  latest?: Product;
  onQuantityChange: (item: CartItemModel, quantity: number) => void;
  onDiscountChange: (item: CartItemModel, discount: number) => void;
  onPriceChange: (item: CartItemModel, price: number) => void;
  deleteItem: (index: number) => void;
  subTotal: number;
  onCheckAll: (event: any) => void;
  onCheck: (state: boolean, index: number) => void;
  setAdded: (items: CartItemModel[]) => void;
  cartItem: number;
  setCartItem: (number: number) => void;
  cartItemType: string;
  setCartItemType: (type: CartItemType) => void;
}

export enum CartItemType {
  quantity = 'quantity',
  discount = 'discount',
  rate = 'rate'
}

export const CartContainer: FunctionComponent<CartContainerProps> = ({
  added, latest, onQuantityChange, onPriceChange, onDiscountChange, deleteItem, subTotal,
  onCheckAll, onCheck, setAdded, cartItem, setCartItem, setCartItemType, cartItemType
}) => {
  const [q, setQ] = useState();
  const allChecked = useMemo(() => {
    return added.length > 0 && added.length === added.filter(item => item.checked).length
  }, [added]);

  const indeterminate = useMemo(() => {
    const checked = added.filter(item => item.checked).length;
    const nonChecked = added.filter(item => !item.checked).length;

    return added.length > 0 && checked > 0 && nonChecked > 0 && added.length !== checked
  }, [added]);

  const updateCartItemType = useCallback((direction: 'left'|'right') => {
    if(cartItemType === CartItemType.quantity){
      if(direction === 'right'){
        setCartItemType(CartItemType.discount);
      }
    }
    if(cartItemType === CartItemType.discount){
      if(direction === 'right'){
        setCartItemType(CartItemType.rate);
      }else{
        setCartItemType(CartItemType.quantity);
      }
    }
    if(cartItemType === CartItemType.rate){
      if(direction === 'left'){
        setCartItemType(CartItemType.discount);
      }
    }
  }, [cartItemType]);

  const updateCartItem = useCallback((direction: 'up'|'down') => {
    const addedItems = added.length;
    if(direction === 'up'){
      if(cartItem !== 0){
        setCartItem(cartItem - 1);
      }else if(cartItem === 0){
        setCartItem(addedItems - 1);
      }
    }
    if(direction === 'down'){
      if(cartItem+1 < addedItems){
        setCartItem(cartItem + 1);
      }else if(cartItem+1 === addedItems){
        setCartItem(0);
      }
    }
  }, [cartItem, added]);

  Mousetrap.bind(['ctrl+up', 'ctrl+down', 'ctrl+left', 'ctrl+right'], function(e: KeyboardEvent){
    //update quantity of last added item
    if(e.code === 'ArrowLeft' || e.code === 'ArrowRight'){
      updateCartItemType(e.code === 'ArrowLeft' ? 'left' : 'right');
    }

    if(e.code === 'ArrowDown' || e.code === 'ArrowUp'){
      updateCartItem(e.code === 'ArrowDown' ? 'down' : 'up');
    }
  });

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
            <div className="table-cell p-2 text-center font-bold w-[80px]">Stock</div>
            <div className="table-cell p-2 text-center font-bold w-[180px]">QTY</div>
            <div className="table-cell p-2 text-center font-bold w-[90px]">Disc.</div>
            <div className="table-cell p-2 text-center font-bold w-[90px]">Taxes</div>
            <div className="table-cell p-2 text-center font-bold w-[100px]">Rate</div>
            <div className="table-cell p-2 text-right font-bold w-[100px]">Total</div>
            {/*<div className="table-cell w-[80px]"/>*/}
          </div>
        </div>
        <div className="table-row-group">
          {added.map((item, index) => (
            <CartItem
              key={index}
              added={added}
              onQuantityChange={onQuantityChange}
              onDiscountChange={onDiscountChange}
              onPriceChange={onPriceChange}
              deleteItem={deleteItem}
              item={item}
              index={index}
              onCheck={onCheck}
              latest={latest}
              cartItemType={cartItemType}
              cartItem={cartItem}
            />
          ))}
        </div>
        <div className="table-footer-group">
          <div className="table-row font-bold">
            <div className="table-cell p-2">
              {added.length}
            </div>
            <div className="table-cell">items</div>
            <div className="table-cell"></div>
            <div className="table-cell text-center p-2">
              {added.reduce((previous, item) => {
                return parseFloat(item.quantity as unknown as string) + previous
              }, 0)}
            </div>
            <div className="table-cell"></div>
            <div className="table-cell"></div>
            <div className="table-cell"></div>
            <div className="table-cell text-right p-2">
              {subTotal}
            </div>
          </div>
        </div>
      </div>
  );
};
