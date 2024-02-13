import React, { FC } from "react";
import { Button } from "../../../app-common/components/input/button";
import localforage from "../../../lib/localforage/localforage";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Shortcut } from "../../../app-common/components/input/shortcut";
import { useAtom } from "jotai";
import { defaultData, defaultState } from "../../../store/jotai";
import { CartItemType } from "../cart/cart.container";

interface Props {}

export const ClearSale: FC<Props> = ({}) => {
  const [appState, setAppState] = useAtom(defaultState);
  const { added } = appState;
  const [defaultAppState] = useAtom(defaultData);

  const { defaultDiscount, defaultPaymentType, defaultTax } =
    defaultAppState;

  const cancel = () => {
    setAppState((prev) => ({
      ...prev,
      added: [],
      customer: undefined,
      adjustment: 0,
      latest: undefined,
      orderId: undefined,
      q: "",
      quantity: 1,
      cartItem: undefined,
      cartItemType: CartItemType.quantity,
      latestQuantity: undefined,
      latestRate: undefined,
      latestVariant: undefined,
      customerName: undefined
    }));

    if (defaultPaymentType) {
      setAppState(prev => ({
        ...prev,
        paymentType: defaultPaymentType
      }))
    } else {
      setAppState(prev => ({
        ...prev,
        paymentType: defaultPaymentType
      }))
    }

    if (defaultDiscount) {
      setAppState((prev) => ({
        ...prev,
        discount: defaultDiscount,
      }));
    } else {
      setAppState((prev) => ({
        ...prev,
        discount: undefined,
        discountAmount: undefined,
      }));
    }

    //set default options
    if (defaultTax) {
      setAppState((prev) => ({
        ...prev,
        tax: defaultTax,
      }));
    } else {
      setAppState((prev) => ({
        ...prev,
        tax: undefined,
      }));
    }
  };
  return (
    <Button
      className="w-full"
      size="lg"
      variant="danger"
      disabled={added.length === 0}
      onClick={cancel}
      type="button">
      <FontAwesomeIcon icon={faTimes} size="lg" />
      <Shortcut shortcut="ctrl+x" handler={cancel} />
    </Button>
  );
};
