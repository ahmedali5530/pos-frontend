import {Button} from "../../button";
import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {OrderTotals} from "../cart/order.totals";
import {Textarea} from "../../textarea";
import {Modal} from "../../modal";
import {CartItem} from "../../../../api/model/cart.item";
import {Controller, useForm} from "react-hook-form";
import {jsonRequest} from "../../../../api/request/request";
import {ORDER_CREATE} from "../../../../api/routing/routes/backend.app";
import {Discount} from "../../../../api/model/discount";
import {Tax} from "../../../../api/model/tax";
import {PaymentType} from "../../../../api/model/payment.type";
import {Customer} from "../../../../api/model/customer";
import classNames from "classnames";
import localforage from "../../../../lib/localforage/localforage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {OrderPayment} from "../../../../api/model/order.payment";
import {Input} from "../../input";
import {useAlert} from "react-alert";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ValidationResult} from "../../../../lib/validator/validation.result";
import Cookies from "js-cookie";
import {Shortcut} from "../../../../app-common/components/input/shortcut";
import {CloseSaleInline} from "./sale.inline";

interface Props {
  added: CartItem[];
  setAdded: (item: CartItem[]) => void;
  discount?: Discount;
  tax?: Tax;
  finalTotal: number;
  paymentTypesList: PaymentType[];
  setDiscount: (discount?: Discount) => void;
  setTax: (tax?: Tax) => void;
  setDiscountAmount: (amount?: number) => void;
  discountAmount?: number;
  subTotal: number;
  taxTotal: number;
  couponTotal: number;
  discountTotal: number;
  customer?: Customer;
  setCustomer: (customer?: Customer) => void;
  refundingFrom?: number;
  setRefundingFrom?: (id?: number) => void;
  closeSale?: boolean;
  setCloseSale?: (state: boolean) => void;
  discountRateType: string | undefined;
  setDiscountRateType: (string?: string) => void;
}

export const CloseSale: FC<Props> = ({
                                       added, setAdded, discount, tax, finalTotal,
                                       setDiscount, setTax, setDiscountAmount, paymentTypesList, subTotal, taxTotal,
                                       couponTotal, discountTotal, customer, setCustomer, discountAmount,
                                       refundingFrom, setRefundingFrom,
                                       closeSale, setCloseSale,
                                       discountRateType, setDiscountRateType
                                     }) => {
  const [saleModal, setSaleModal] = useState<boolean>(false);

  useEffect(() => {
    if (closeSale !== undefined) {
      setSaleModal(closeSale);
    }
  }, [closeSale]);

  return (
    <>
      <Button className="w-full btn-success" size="lg" disabled={added.length === 0} onClick={() => {
        setSaleModal(true);
      }}>
        <FontAwesomeIcon icon={faCheck} className="mr-2" /> Close
      </Button>

      <Modal open={saleModal} onClose={() => {
        setSaleModal(false);
        setCloseSale!(false);
      }} title="Close sale">
        <CloseSaleInline
          added={added}
          setAdded={setAdded}
          finalTotal={finalTotal}
          paymentTypesList={paymentTypesList}
          setDiscount={setDiscount}
          setTax={setTax}
          setDiscountAmount={setDiscountAmount}
          subTotal={subTotal}
          taxTotal={taxTotal}
          couponTotal={couponTotal}
          discountTotal={discountTotal}
          discount={discount}
          tax={tax}
          customer={customer}
          setCustomer={setCustomer}
          discountAmount={discountAmount}
          refundingFrom={refundingFrom}
          setRefundingFrom={setRefundingFrom}
          setCloseSale={setCloseSale}
          closeSale={closeSale}
          setDiscountRateType={setDiscountRateType}
          discountRateType={discountRateType}
          isInline={false}
          setSaleModal={setSaleModal}
          saleModal={saleModal}
        />
      </Modal>
    </>
  );
};
