import React, {FunctionComponent, useEffect, useMemo, useRef, useState} from "react";
import classNames from "classnames";
import {Input} from "../../../app-common/components/input/input";
import {CartItem as CartItemModel} from "../../../api/model/cart.item";
import {getRowTotal} from "../../containers/dashboard/pos";
import {Checkbox} from "../../../app-common/components/input/checkbox";
import {useAtom} from "jotai";
import {appState as AppState, defaultState} from "../../../store/jotai";
import {formatNumber, withCurrency} from "../../../lib/currency/currency";
// @ts-ignore
import Spinner from "../../../assets/images/spinner.svg";
import {CartItemType} from "./cart.container";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import {toRecordId} from "../../../api/model/common";

interface CartItemProps {
  onQuantityChange: (item: CartItemModel, quantity: any) => void;
  onDiscountChange: (item: CartItemModel, discount: number) => void;
  onPriceChange: (item: CartItemModel, price: number) => void;
  deleteItem: (index: number) => void;
  item: CartItemModel;
  index: number;
  onCheck: (state: boolean, index: number) => void;
}

interface ItemInfo {
  quantity: number;
}

export const CartItem: FunctionComponent<CartItemProps> = ({
  onQuantityChange,
  onPriceChange,
  onDiscountChange,
  onCheck,
  item,
  index,
}) => {
  const db = useDB();

  const [isLoading, setLoading] = useState(false);
  const [itemInfo, setItemInfo] = useState<ItemInfo>();
  const [appState, setAppState] = useAtom(defaultState);
  const {cartItemType, cartItem, refundingFrom} = appState;
  const taxTotal = useMemo(() => {
    return item.taxes.reduce(
      (prev, tax) => prev + (tax.rate * item.price) / 100,
      0
    );
  }, [item]);

  const [appSt] = useAtom(AppState);
  const {store} = appSt;

  const getItemsMetadata = async (itemId: string, variantId?: string) => {
    setLoading(true);
    try {
      if (variantId) {
        const [quantity] = await db.query(`SELECT quantity
                                           FROM ${Tables.product_variant_store}
                                           where store = $store
                                             and variant = $variant`, {
          store: toRecordId(store?.id),
          variant: toRecordId(variantId)
        });

        if (quantity.length > 0) {
          setItemInfo({
            quantity: formatNumber(quantity[0].quantity)
          })

          return;
        }
      }

      if (itemId) {
        const [quantity] = await db.query(`SELECT quantity
                                           FROM ${Tables.product_store}
                                           where store = $store
                                             and product = $product`, {
          store: toRecordId(store?.id),
          product: toRecordId(itemId)
        });

        if (quantity.length > 0) {
          setItemInfo({
            quantity: formatNumber(quantity[0].quantity)
          })
        }
      }

    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  }

  let qtyRef = useRef<HTMLInputElement>();
  let discRef = useRef<HTMLInputElement>();
  let rateRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (cartItem === index) {
      if (cartItemType === "quantity") {
        qtyRef.current?.focus();
        qtyRef.current?.select();
      }

      if (cartItemType === "discount") {
        discRef.current?.focus();
        discRef.current?.select();
      }

      if (cartItemType === "rate") {
        rateRef.current?.focus();
        rateRef.current?.select();
      }
    }
  }, [cartItem, cartItemType, index]);

  useEffect(() => {
    if (item.item.manage_inventory) {
      getItemsMetadata(item.item.id, item?.variant?.id);
    }
  }, [item]);

  return (
    <div className={classNames("table-row hover:bg-gray-200")} key={index}>
      <div className="table-cell p-2">
        <Checkbox
          checked={item.checked}
          onChange={(event) => onCheck(event.currentTarget.checked, index)}
          id={index.toString()}
          tabIndex={-1}
          className="align-middle"
        />
      </div>
      <div className="table-cell p-1">
        <label htmlFor={index.toString()}>
          <div>{item.item.name}</div>
          {item.variant && (
            <div className="text-sm text-primary-800">
              {item.variant?.attribute_value && (
                <>{item.variant?.attribute_value}</>
              )}
            </div>
          )}
        </label>
      </div>
      <div className="table-cell p-1 text-center">
        {item.item.manage_inventory && (
          <>
            {isLoading ? (
              <img alt="loading..." src={Spinner} className="w-[16px]"/>
            ) : (
              <span
                className={Number(itemInfo?.quantity) <= 0 ? 'text-danger-100 animate-pulse duration-500 font-extrabold bg-danger-500 rounded px-1' : ''}>{itemInfo?.quantity}</span>
            )}
          </>
        )}
      </div>
      <div className="table-cell p-1">
        <div className="flex justify-center">
          <div className="input-group">
            {/*<Button
              tabIndex={-1}
              size="lg"
              type="button"
              variant="primary"
              onClick={() => onQuantityChange(item, Number(item.quantity) - 1)}>
              <FontAwesomeIcon icon={faMinus} />
            </Button>*/}
            <Input
              type="number"
              value={item.quantity}
              className={"text-center w-full mousetrap"}
              onChange={(event) => {
                onQuantityChange(item, event.currentTarget.value)
              }}
              onFocus={() => {
                setAppState(prev => ({
                  ...prev,
                  cartItem: index,
                  cartItemType: CartItemType.quantity
                }));
              }}
              ref={qtyRef}
            />
            {/*<Button
              tabIndex={-1}
              size="lg"
              type="button"
              variant="primary"
              onClick={() => onQuantityChange(item, Number(item.quantity) + 1)}>
              <FontAwesomeIcon icon={faPlus} />
            </Button>*/}
          </div>
        </div>
      </div>
      <div className="table-cell text-center p-1">
        <Input
          type="number"
          value={item.discount}
          className={"text-center w-full mousetrap"}
          onChange={(event) => {
            onDiscountChange(item, +event.currentTarget.value);
          }}
          ref={discRef}
          onFocus={() => {
            setAppState(prev => ({
              ...prev,
              cartItem: index,
              cartItemType: CartItemType.discount
            }))
          }}
        />
      </div>
      <div className="table-cell p-2 text-center">
        {item.taxIncluded ? (
          taxTotal
        ) : (
          <span className="line-through">{withCurrency(taxTotal)}</span>
        )}
      </div>
      <div className="table-cell text-right p-1">
        <Input
          value={item.price}
          type="number"
          className={"text-center w-full mousetrap"}
          onChange={(event) => onPriceChange(item, +event.currentTarget.value)}
          ref={rateRef}
          disabled
        />
      </div>
      <div className="table-cell p-2 text-right">{formatNumber(getRowTotal(item))}</div>
    </div>
  );
};
