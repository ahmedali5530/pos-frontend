import { Button } from "../../../app-common/components/input/button";
import React, { FC, useEffect, useState } from "react";
import { Modal } from "../../../app-common/components/modal/modal";
import { CartItem } from "../../../api/model/cart.item";
import { Discount } from "../../../api/model/discount";
import { Tax } from "../../../api/model/tax";
import { PaymentType } from "../../../api/model/payment.type";
import { Customer } from "../../../api/model/customer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { CloseSaleInline } from "./sale.inline";

interface Props {
  added: CartItem[];
  finalTotal: number;
  paymentTypesList: PaymentType[];
  subTotal: number;
  taxTotal: number;
  couponTotal: number;
  discountTotal: number;
  closeSale?: boolean;
  setCloseSale?: (state: boolean) => void;
}

export const CloseSale: FC<Props> = ({
  added,
  finalTotal,
  paymentTypesList,
  subTotal,
  taxTotal,
  couponTotal,
  discountTotal,
  closeSale,
  setCloseSale,
}) => {
  const [saleModal, setSaleModal] = useState<boolean>(false);

  useEffect(() => {
    if (closeSale !== undefined) {
      setSaleModal(closeSale);
    }
  }, [closeSale]);

  return (
    <>
      <Button
        className="w-full btn-success"
        size="lg"
        disabled={added.length === 0}
        onClick={() => {
          setSaleModal(true);
        }}>
        <FontAwesomeIcon icon={faCheck} className="mr-2" /> Close
      </Button>

      <Modal
        open={saleModal}
        onClose={() => {
          setSaleModal(false);
          setCloseSale!(false);
        }}
        title="Close sale">
        <CloseSaleInline
          finalTotal={finalTotal}
          paymentTypesList={paymentTypesList}
          subTotal={subTotal}
          taxTotal={taxTotal}
          couponTotal={couponTotal}
          discountTotal={discountTotal}
          isInline={false}
          setSaleModal={setSaleModal}
          saleModal={saleModal}
        />
      </Modal>
    </>
  );
};
