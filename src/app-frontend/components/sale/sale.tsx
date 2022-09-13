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
import localforage from "../../../lib/localforage/localforage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {OrderPayment} from "../../../api/model/order.payment";
import {Input} from "../input";
import {useAlert} from "react-alert";

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
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [hold, setHold] = useState(false);
  const [quickCashOperation, setQuickCashOperation] = useState<'add' | 'subtract' | 'exact'>('exact');
  const [quickCashItems, setQuickCashItems] = useState<number[]>([5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1]);

  const alert = useAlert();

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
        payments: payments,
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
      setPayments([]);

    } catch (e) {
      throw e;
    } finally {
      setSaleClosing(false);
    }
  };

  const changeDue = useMemo(() => {
    //get a total of payments
    return payments.reduce((prev, current) => Number(prev) + Number(current.received), 0) - finalTotal;
  }, [payments, finalTotal]);

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
    if(payments.length === 0 && saleModal){
      localforage.getItem('defaultPaymentType').then((data: any) => {
        if (data !== null) {
          addSplitPayment(finalTotal, data);
        }
      });
    }
  }, [saleModal]);

  const received = useMemo(() => {
    return payments.reduce((prev, current) => Number(prev) + Number(current.received), 0)
  }, [payments]);

  useEffect(() => {
    reset({
      received: finalTotal.toFixed(2)
    });
  }, [finalTotal]);

  const addQuickCash = useCallback((item: number, cashOperation?: string) => {
    let method = cashOperation || quickCashOperation;

    if (method === 'exact') {
      // reset({
      //   received: 0
      // });

      addSplitPayment(item, payment);
    } else if (method === 'add') {
      // reset({
      //   received: finalTotal - item
      // });

      addSplitPayment(item, payment);
    } else if (method === 'subtract') {
      // reset({
      //   received: finalTotal + item
      // });

      addSplitPayment(-item, payment);
    }
  }, [quickCashOperation, reset, finalTotal, payments]);

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

  const addSplitPayment = (amount: number, payment?: PaymentType) => {
    if(amount === 0){
      alert.error('Amount cannot be zero');

      return false;
    }

    if(!payment?.canHaveChangeDue && (amount + received) > finalTotal ){
      alert.error(`Please add exact amount for ${payment?.name}`);

      return false;
    }

    const prevPayments = [...payments];
    prevPayments.push({
      total: finalTotal,
      received: amount,
      due: amount - finalTotal,
      type: payment
    });

    setPayments(prevPayments);

    reset({
      received: finalTotal - prevPayments.reduce((prev, current) => Number(prev) + Number(current.received), 0)
    });
  };

  const removeSplitPayment = (item: number) => {

    const prevPayments = [...payments];

    prevPayments.splice(item, 1);

    setPayments(prevPayments);

    reset({
      received: finalTotal - prevPayments.reduce((prev, current) => Number(prev) + Number(current.received), 0)
    });
  };

  const getQuickCashCounter = (amount: number) => {
    return payments.filter(item => Number(item.received) === amount).length;
  };

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
                  <Button disabled={!payment?.canHaveChangeDue} className="w-full btn-warning relative" size="lg" key={item}
                          onClick={() => addQuickCash(item)}>
                    {item}
                    {getQuickCashCounter(item) > 0 && (
                      <span className="quick-cash-badge">{getQuickCashCounter(item)}</span>
                    )}
                  </Button>
                ))}
                <Button disabled={!payment?.canHaveChangeDue} className="w-full btn-primary" size="lg" key={finalTotal}
                        onClick={() => addQuickCash(finalTotal, 'exact')}>{finalTotal.toFixed(2)}</Button>
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
                          <Input
                            onChange={props.field.onChange}
                            value={props.field.value}
                            type="number"
                            readOnly={payment?.canHaveChangeDue !== true}
                            id="amount"
                            placeholder="Payment"
                            className="w-full flex-1 lg input"
                            selectable={true}
                          />
                        </>
                      )
                    }}
                    defaultValue={finalTotal}
                  />
                  <button type="button" className="btn btn-secondary lg w-24" onClick={() => addSplitPayment(watch('received'), payment)}>
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
            <div className="grid grid-cols-2 gap-y-3">
              {payments.map((item, index) => (
                <div className="grid grid-cols-4 gap-3" key={index}>
                  <div>{item?.type?.name}</div>
                  <div>{item.received}</div>
                  <div>
                    <button className="btn btn-danger" type="button" onClick={() => removeSplitPayment(index)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </form>
      </Modal>
    </>
  );
};
