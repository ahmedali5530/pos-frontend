import React, {FunctionComponent} from "react";
import classNames from "classnames";
import {Button} from "../../button";
import {Input} from "../../input";
import {Product} from "../../../../api/model/product";
import {CartItem as CartItemModel} from "../../../../api/model/cart.item";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getRowTotal} from "../../../containers/dashboard/pos";

interface CartItemProps {
  added: CartItemModel[];
  latest?: Product;
  onQuantityChange: (item: CartItemModel, quantity: number) => void;
  onDiscountChange: (item: CartItemModel, discount: number) => void;
  onPriceChange: (item: CartItemModel, price: number) => void;
  deleteItem: (index: number) => void;
  subTotal: number;
  item: CartItemModel;
  index: number
}

export const CartItem: FunctionComponent<CartItemProps> = ({
                                                             added, latest, onQuantityChange, onPriceChange, onDiscountChange, deleteItem, subTotal,
                                                             item, index
                                                           }) => {
  return (
    <div className={
      classNames(
        'table-row hover:bg-gray-200',
        latest && latest.id === item.item.id ? 'fade-highlight' : ''
      )
    } key={index}>
      <div className="table-cell p-2">
        {item.item.name}
        {item.variant && (
          <div>
            {item.variant?.attributeName && item.variant?.attributeValue && (
              <>
                {item.variant?.attributeName} <span className={
                classNames(
                  'mr-3 ml-2 text-sm px-3'
                )
              }>{item.variant?.attributeValue}</span>
              </>
            )}
          </div>
        )}
      </div>
      <div className="table-cell p-2 text-center">
        {/*<Button type="button" variant={item.quantity === 1 ? 'danger' : 'secondary'} onClick={() => onQuantityChange(item, item.quantity - 1)}>
          {item.quantity === 1 ? (
            <FontAwesomeIcon icon={faTrash}/>
          ) : (
            <FontAwesomeIcon icon={faMinus}/>
          )}
        </Button>*/}
        <span className="inline-block w-[64px]">
          <Input
            value={item.quantity}
            className="text-center"
            onChange={(event) => onQuantityChange(item, +event.currentTarget.value)}
            selectable
          />
        </span>
        {/*<Button type="button" variant="secondary" onClick={() => onQuantityChange(item, item.quantity + 1)}>
          <FontAwesomeIcon icon={faPlus}/>
        </Button>*/}

      </div>
      <div className="table-cell p-2 text-center">
        <Input
          value={item.discount}
          className="text-center"
          onChange={(event) => {
            onDiscountChange(item, +event.currentTarget.value)
          }}
          selectable
        />
      </div>
      <div className="table-cell p-2 text-right">
      <span className="">
        <Input
          value={item.price}
          className="text-center"
          onChange={(event) => onPriceChange(item, +event.currentTarget.value)}
          selectable
        />
      </span>
      </div>
      <div className="table-cell p-2 text-right">{getRowTotal(item)}</div>
      <div className="table-cell p-2 text-center">
        <Button variant="danger" className="text-rose-500" onClick={() => deleteItem(index)}>
          <FontAwesomeIcon icon={faTrash}/>
        </Button>
      </div>
    </div>
  );
};
