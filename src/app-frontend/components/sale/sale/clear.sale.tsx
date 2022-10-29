import React, {FC} from "react";
import {Button} from "../../button";
import {CartItem} from "../../../../api/model/cart.item";
import {Discount} from "../../../../api/model/discount";
import {Tax} from "../../../../api/model/tax";
import localforage from "../../../../lib/localforage/localforage";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Shortcut} from "../../../../app-common/components/input/shortcut";


interface Props{
  added: CartItem[];
  setAdded: (items: CartItem[]) => void;
  setDiscount: (discount?: Discount) => void;
  setTax: (tax?: Tax) => void;
  setDiscountAmount: (discount?: number) => void;
  setAdjustment: (adjustment: number) => void;
}

export const ClearSale: FC<Props> = ({
  added, setAdded, setDiscount, setTax, setDiscountAmount, setAdjustment
}) => {

  const cancel = () => {
    setAdded([]);
    setAdjustment(0);
    //delete from localforage

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
    <Button className="w-full"
            size="lg"
            variant="danger"
            disabled={added.length === 0}
            onClick={cancel}
            type="button"
    >
      <FontAwesomeIcon icon={faTimes} className="mr-2" />Cancel
      <Shortcut shortcut="ctrl+x" handler={cancel} />
    </Button>
  );
};
