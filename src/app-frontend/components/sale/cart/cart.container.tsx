import React, {createRef, FunctionComponent, useMemo} from "react";
import {CartItem as CartItemModel} from "../../../../api/model/cart.item";
import {Product} from "../../../../api/model/product";
import {CartItem} from "./cart.item";
import {Checkbox} from "../../checkbox";

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
}

export const CartContainer: FunctionComponent<CartContainerProps> = ({
  added, latest, onQuantityChange, onPriceChange, onDiscountChange, deleteItem, subTotal,
  onCheckAll, onCheck
}) => {
  const allChecked = useMemo(() => {
    return added.length > 0 && added.length === added.filter(item => item.checked).length
  }, [added]);

  return (
    <>
      <div className="table w-full">
        <div className="table-header-group sticky top-0 z-10 bg-gray-200">
          <div className="table-row">
            <div className="table-cell p-2 w-[30px]">
              <Checkbox checked={allChecked} onChange={onCheckAll}/>
            </div>
            <div className="table-cell p-2 text-left font-bold">Item</div>
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
            />
          ))}
        </div>
        <div className="table-footer-group">
          <div className="table-row font-bold">
            <div className="table-cell p-2">Total</div>
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
    </>
  );
};
