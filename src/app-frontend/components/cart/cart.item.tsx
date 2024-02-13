import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { Button } from "../../../app-common/components/input/button";
import { Input } from "../../../app-common/components/input/input";
import { CartItem as CartItemModel } from "../../../api/model/cart.item";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getRowTotal } from "../../containers/dashboard/pos";
import { Checkbox } from "../../../app-common/components/input/checkbox";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";
import { formatNumber, withCurrency } from "../../../lib/currency/currency";
import QueryString from "qs";
import { jsonRequest } from "../../../api/request/request";
import { PRODUCT_QUANTITIES } from "../../../api/routing/routes/backend.app";
import { useSelector } from "react-redux";
import { getStore } from "../../../duck/store/store.selector";
// @ts-ignore
import Spinner from "../../../assets/images/spinner.svg";

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
  quantity: string;
}

export const CartItem: FunctionComponent<CartItemProps> = ({
  onQuantityChange,
  onPriceChange,
  onDiscountChange,
  onCheck,
  item,
  index,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [itemInfo, setItemInfo] = useState<ItemInfo>();
  const [appState, setAppState] = useAtom(defaultState);
  const { latestIndex, cartItemType, cartItem } = appState;
  const taxTotal = useMemo(() => {
    return item.taxes.reduce(
      (prev, tax) => prev + (tax.rate * item.price) / 100,
      0
    );
  }, [item]);

  const store = useSelector(getStore);

  const getItemsMetadata = async (itemId: number, variantId?: number) => {
    setLoading(true);
    try {
      const search = QueryString.stringify({
        itemId,
        variantId,
        store: store?.id,
      });
      const response = await jsonRequest(`${PRODUCT_QUANTITIES}?${search}`);
      const json = await response.json();

      setItemInfo(json);

    } catch ( e ) {
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
    if(item.item.manageInventory) {
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
            <div className="text-sm">
              {item.variant?.attributeValue && (
                <>{item.variant?.attributeValue}</>
              )}
            </div>
          )}
        </label>
      </div>
      <div className="table-cell p-1 text-center">
        {item.item.manageInventory && (
          <>
            {isLoading ? (
              <img alt="loading..." src={Spinner} className="w-[16px]"/>
            ) : (
              <span className={Number(itemInfo?.quantity) <= 0 ? 'text-danger-500 animated blink' : ''}>{itemInfo?.quantity}</span>
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
              className={"text-center w-full lg mousetrap"}
              onChange={(event) =>
                onQuantityChange(item, event.currentTarget.value)
              }
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
          className={"text-center w-full lg mousetrap"}
          onChange={(event) => {
            onDiscountChange(item, +event.currentTarget.value);
          }}
          ref={discRef}
        />
      </div>
      <div className="table-cell p-2 text-center">
        {item.taxIncluded ? (
          taxTotal
        ) : (
          <span className="line-through">{taxTotal}</span>
        )}
      </div>
      <div className="table-cell text-right p-1">
        <Input
          value={item.price}
          type="number"
          className={"text-center w-full lg mousetrap"}
          onChange={(event) => onPriceChange(item, +event.currentTarget.value)}
          ref={rateRef}
          disabled
        />
      </div>
      <div className="table-cell p-2 text-right">{formatNumber(getRowTotal(item))}</div>
    </div>
  );
};
