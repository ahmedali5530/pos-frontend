import {Button} from "../../../app-common/components/input/button";
import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../app-common/components/modal/modal";
import {CartItem} from "../../../api/model/cart.item";
import {Discount} from "../../../api/model/discount";
import {Tax} from "../../../api/model/tax";
import {PaymentType} from "../../../api/model/payment.type";
import {Customer} from "../../../api/model/customer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
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
  adjustment: number;
  setAdjustment: (adj: number) => void;
}

export const CloseSale: FC<Props> = ({
                                       added, setAdded, discount, tax, finalTotal,
                                       setDiscount, setTax, setDiscountAmount, paymentTypesList, subTotal, taxTotal,
                                       couponTotal, discountTotal, customer, setCustomer, discountAmount,
                                       refundingFrom, setRefundingFrom,
                                       closeSale, setCloseSale,
                                       discountRateType, setDiscountRateType, adjustment, setAdjustment
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
        <FontAwesomeIcon icon={faCheck} className="mr-2"/> Close
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
          adjustment={adjustment}
          setAdjustment={setAdjustment}
        />
      </Modal>
    </>
  );
};
