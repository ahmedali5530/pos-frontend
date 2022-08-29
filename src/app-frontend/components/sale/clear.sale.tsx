import React, {FC} from "react";
import {Button} from "../button";
import {CartItem} from "../../../api/model/cart.item";
import {Discount} from "../../../api/model/discount";
import {Tax} from "../../../api/model/tax";
import localforage from "../../../lib/localforage/localforage";


interface Props{
  added: CartItem[];
  setAdded: (items: CartItem[]) => void;
  setDiscount: (discount?: Discount) => void;
  setTax: (tax?: Tax) => void;
  setDiscountAmount: (discount?: number) => void;
}

export const ClearSale: FC<Props> = ({
  added, setAdded, setDiscount, setTax, setDiscountAmount
}) => {

  const cancel = () => {
    setAdded([]);

    localforage.getItem('defaultDiscount').then((data: any) => {
      if(data) {
        setDiscount(data);
      }else{
        setDiscount(undefined);
        setDiscountAmount(undefined);
      }
    });

    //set default options
    localforage.getItem('defaultTax').then((data: any) => {
      if(data) {
        setTax(data);
      }else{
        setTax(undefined);
      }
    });
  };
  return (
    <Button className="w-24"
            size="lg"
            variant="danger"
            disabled={added.length === 0}
            onClick={cancel}
            type="button"
    >Cancel</Button>
  );
};
