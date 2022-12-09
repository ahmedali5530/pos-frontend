import React, {FunctionComponent, useMemo} from "react";
import classNames from "classnames";
import {Button} from "../../button";
import {Input} from "../../input";
import {Product} from "../../../../api/model/product";
import {CartItem as CartItemModel} from "../../../../api/model/cart.item";
import {faMinus, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getRowTotal} from "../../../containers/dashboard/pos";
import {Checkbox} from "../../checkbox";

interface CartItemProps {
  added: CartItemModel[];
  latest?: Product;
  onQuantityChange: (item: CartItemModel, quantity: any) => void;
  onDiscountChange: (item: CartItemModel, discount: number) => void;
  onPriceChange: (item: CartItemModel, price: number) => void;
  deleteItem: (index: number) => void;
  item: CartItemModel;
  index: number;
  onCheck: (state: boolean, index: number) => void;
}

export const CartItem: FunctionComponent<CartItemProps> = ({
  latest, onQuantityChange, onPriceChange, onDiscountChange, deleteItem, onCheck,
  item, index
}) => {
  const taxTotal = useMemo(() => {
    return item.taxes.reduce((prev, tax) => prev + (tax.rate * item.price / 100), 0)
  }, [item]);

  return (
    <div className={
      classNames(
        'table-row hover:bg-gray-200',
        latest && latest.id === item.item.id ? 'fade-highlight' : ''
      )
    } key={index}>
      <div className="table-cell p-2">
        <Checkbox
          checked={item.checked}
          onChange={(event) => onCheck(event.currentTarget.checked, index)}
          id={index.toString()}
        />
      </div>
      <div className="table-cell">
        <label htmlFor={index.toString()} className="">
          <div>{item.item.name}</div>
          {item.variant && (
            <div className="text-sm">
              {item.variant?.attributeValue && (
                <>{item.variant?.attributeValue}</>
              )}
            </div>
          )}
        </label>
      </div>
      <div className="table-cell p-2">
        <div className="flex justify-center">
          <div className="input-group">
            <Button type="button" variant="secondary" onClick={() => onQuantityChange(item, item.quantity - 1)}>
              <FontAwesomeIcon icon={faMinus}/>
            </Button>
            <Input
              value={item.quantity}
              className="text-center w-[64px]"
              onChange={(event) => onQuantityChange(item, event.currentTarget.value)}
              selectable={true}
            />
            <Button type="button" variant="secondary" onClick={() => onQuantityChange(item, item.quantity + 1)}>
              <FontAwesomeIcon icon={faPlus}/>
            </Button>
          </div>
        </div>
      </div>
      <div className="table-cell p-2 text-center">
        <Input
          value={item.discount}
          className="text-center w-full"
          onChange={(event) => {
            onDiscountChange(item, +event.currentTarget.value)
          }}
          selectable={true}
        />
      </div>
      <div className="table-cell p-2 text-center">
        {item.taxIncluded ? taxTotal : (
            <span className="line-through">
              {taxTotal}
            </span>
          )
        }
      </div>
      <div className="table-cell p-2 text-right">
        <Input
          value={item.price}
          className="text-center w-full"
          onChange={(event) => onPriceChange(item, +event.currentTarget.value)}
          selectable={true}
        />
      </div>
      <div className="table-cell p-2 text-right">{getRowTotal(item)}</div>
      {/*<div className="table-cell p-2 text-center">
        <Button variant="danger" className="text-danger-500" onClick={() => deleteItem(index)}>
          <FontAwesomeIcon icon={faTrash}/>
        </Button>
      </div>*/}
    </div>
  );
};
