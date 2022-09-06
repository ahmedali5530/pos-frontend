import {Button} from "../button";
import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {OrderTotals} from "./cart/order.totals";
import {Textarea} from "../textare";
import {Modal} from "../modal";
import {CartItem} from "../../../api/model/cart.item";
import {Controller, useForm} from "react-hook-form";
import {jsonRequest} from "../../../api/request/request";
import {ORDER_CREATE} from "../../../api/routing/routes/backend.app";
import {Discount} from "../../../api/model/discount";
import {Tax} from "../../../api/model/tax";
import {PaymentType} from "../../../api/model/payment.type";
import {Customer} from "../../../api/model/customer";
import classNames from "classnames";
import {KeyboardInput} from "../keyboard.input";
import localforage from "../../../lib/localforage/localforage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faPlus} from "@fortawesome/free-solid-svg-icons";

const Mousetrap = require('mousetrap');

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
  const [saleModal, setSaleModal] = useState(false);
  const {register, handleSubmit, watch, reset, control, getValues} = useForm();
  const [isSaleClosing, setSaleClosing] = useState(false);
  const [payment, setPayment] = useState<PaymentType>();
  const [hold, setHold] = useState(false);
  const [quickCashOperation, setQuickCashOperation] = useState<'add' | 'subtract' | 'exact'>('exact');
  const [quickCashItems, setQuickCashItems] = useState<number[]>([5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1]);

  useEffect(() => {
    if (closeSale !== undefined) {
      setSaleModal(closeSale);
    }
  }, [closeSale]);

  const resetFields = () => {
    setAdded([]);
    setCustomer(undefined);
    setRefundingFrom!(undefined);
    setSaleModal(false);
    reset({
      received: undefined
    });

    localforage.getItem('defaultPaymentType').then((data: any) => {
      if (data) {
        setPayment(data);
      } else {
        setPayment(undefined);
      }
    });

    localforage.getItem('defaultDiscount').then((data: any) => {
      if (data) {
        setDiscount(data);
      } else {
        setDiscount(undefined);
        setDiscountAmount(undefined);
      }
    });

    //set default options
    localforage.getItem('defaultTax').then((data: any) => {
      if (data) {
        setTax(data);
      } else {
        setTax(undefined);
      }
    });

    setHold(false);
  };

  const onSaleSubmit = async (values: any) => {
    setSaleClosing(true);
    try {
      const formValues: any = {
        items: added,
        discount: discount,
        tax: tax,
        payments: [{
          total: finalTotal,
          received: values.received,
          due: values.received - finalTotal,
          type: payment
        }],
        customerId: customer?.id,
        discountAmount: discountTotal,
        discountRateType: discountRateType,
        refundingFrom: refundingFrom,
        notes: values.notes
      };

      if (hold) {
        formValues['isSuspended'] = true;
      }

      await jsonRequest(ORDER_CREATE, {
        method: 'POST',
        body: JSON.stringify(formValues)
      });

      resetFields();

    } catch (e) {
      throw e;
    } finally {
      setSaleClosing(false);
    }
  };

  const received = watch('received');
  const changeDue = useMemo(() => {
    if (received === undefined) {
      return 0;
    }

    if (received === '') {
      return -finalTotal;
    }

    return parseFloat(received) - finalTotal
  }, [received, finalTotal]);

  useEffect(() => {
    if (payment === undefined) {
      //check for default payment
      localforage.getItem('defaultPaymentType').then((data: any) => {
        if (data !== null) {
          setPayment(data);
        } else {
          if (paymentTypesList.length > 0) {
            setPayment(paymentTypesList[0]);
          }
        }
      });
    }
  }, [paymentTypesList, payment, saleModal]);

  useEffect(() => {
    reset({
      received: finalTotal.toFixed(2)
    });
  }, [finalTotal]);

  const addQuickCash = useCallback((item: number, cashOperation?: string) => {
    let method = cashOperation || quickCashOperation;

    if (method === 'exact') {
      reset({
        received: item
      });
    } else if (method === 'add') {
      reset({
        received: item + parseFloat(watch('received'))
      });
    } else if (method === 'subtract') {
      reset({
        received: watch('received') - item
      });
    }
  }, [quickCashOperation, watch('received'), reset]);

  useEffect(() => {
    Mousetrap.bind('ctrl+s', function (e: Event) {
      e.preventDefault();
      //open sale modal
      if (added.length > 0) {
        setSaleModal(true);
      }

      if(saleModal){
        //close sale
        onSaleSubmit(getValues())
      }
    });
  }, [added, saleModal]);

  return (
    <>
      <Button className="w-24 btn-success" size="lg" disabled={added.length === 0} onClick={() => {
        setSaleModal(true);
      }}><FontAwesomeIcon icon={faCheck} className="mr-2" />Pay</Button>

      <Modal open={saleModal} onClose={() => {
        setSaleModal(false);
        setCloseSale!(false);
      }} title="Close sale">
        <div className="mb-5">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4">
              <OrderTotals
                subTotal={subTotal}
                setTax={setTax}
                taxTotal={taxTotal}
                setDiscount={setDiscount}
                setDiscountAmount={setDiscountAmount}
                discountTotal={discountTotal}
                couponTotal={couponTotal}
                finalTotal={finalTotal}
                inSale={true}
                setCustomer={setCustomer}
                customer={customer}
                discountAmount={discountAmount}
                added={added}
                discount={discount}
                setDiscountRateType={setDiscountRateType}
                discountRateType={discountRateType}
                tax={tax}
              >
                <tr>
                  <th className={
                    classNames(
                      `border border-gray-300 p-2 text-left text-4xl font-bold`,
                      changeDue < 0 ? 'text-red-500' : ' text-emerald-500'
                    )
                  }>
                    Change Due
                  </th>
                  <td className={
                    classNames(
                      `border border-gray-300 p-2 text-right text-4xl font-bold`,
                      changeDue < 0 ? 'text-red-500' : ' text-emerald-500'
                    )
                  }>
                    {changeDue.toFixed(2)}
                  </td>
                </tr>
              </OrderTotals>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-3 gap-4">
                <Button className="btn-secondary" size="lg" active={quickCashOperation === 'exact'}
                        onClick={() => setQuickCashOperation('exact')}>Exact</Button>
                <Button className="btn-secondary" size="lg" active={quickCashOperation === 'add'}
                        onClick={() => setQuickCashOperation('add')}>Add</Button>
                <Button className="btn-secondary" size="lg" active={quickCashOperation === 'subtract'}
                        onClick={() => setQuickCashOperation('subtract')}>Subtract</Button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {quickCashItems.map(item => (
                  <Button disabled={!payment?.canHaveChangeDue} className="w-full btn-warning" size="lg" key={item}
                          onClick={() => addQuickCash(item)}>{item}</Button>
                ))}
                <Button disabled={!payment?.canHaveChangeDue} className="w-full btn-primary" size="lg" key={finalTotal}
                        onClick={() => addQuickCash(finalTotal, 'exact')}>{finalTotal.toFixed(2)}</Button>
                <Button disabled={!payment?.canHaveChangeDue} className="w-full btn-danger" size="lg" key={0}
                        onClick={() => addQuickCash(0, 'exact')}>C</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          {paymentTypesList.map((pt, index) => {
            return (
              <Button
                key={index}
                onClick={() => {
                  setPayment(pt);
                }}
                className="mr-5 mb-5 btn-primary"
                active={payment?.id === pt.id}
                type="button"
                size="lg"
                disabled={pt.type === 'credit' && (customer === undefined || customer === null)}
              >{pt.name}</Button>
            );
          })}
        </div>
        <form onSubmit={handleSubmit(onSaleSubmit)}>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="mb-5">
                <div className="input-group">
                  <Controller
                    name="received"
                    control={control}
                    render={(props) => {
                      return (
                        <>
                          <KeyboardInput
                            onchange={props.field.onChange}
                            value={props.field.value}
                            type="number"
                            readOnly={payment?.canHaveChangeDue !== true}
                            id="amount"
                            placeholder="Payment"
                            triggerWithIcon
                            innerRef={props.field.ref}
                            className="w-full flex-1 lg"
                          />
                        </>
                      )
                    }}
                    defaultValue={finalTotal}
                  />
                  <button type="button" className="btn btn-secondary lg w-24">
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="notes">Notes</label>
                <Textarea {...register('notes')} id="notes"/>
              </div>

              <Button className="btn-success mr-12 w-48" type="submit" disabled={changeDue < 0 || isSaleClosing}
                      size="lg">
                {isSaleClosing ? 'Completing...' : 'Complete'}
              </Button>

              <Button
                type="submit"
                disabled={isSaleClosing}
                size="lg"
                className="w-48 btn-warning"
                onClick={() => setHold(true)}
              >
                {isSaleClosing ? 'Holding...' : 'Hold'}
              </Button>
            </div>
            <div>
              split payments
            </div>
          </div>

        </form>
      </Modal>
    </>
  );
};
