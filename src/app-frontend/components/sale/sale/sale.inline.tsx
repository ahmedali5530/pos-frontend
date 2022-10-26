import {Button} from "../../button";
import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {OrderTotals} from "../cart/order.totals";
import {Textarea} from "../../textarea";
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
import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {OrderPayment} from "../../../../api/model/order.payment";
import {Input} from "../../input";
import {useAlert} from "react-alert";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ValidationResult} from "../../../../lib/validator/validation.result";
import {Shortcut} from "../../../../app-common/components/input/shortcut";
import {ClearSale} from "./clear.sale";
import ScrollContainer from "react-indiana-drag-scroll";
import {PrintOrder} from "./sale.print";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {getTerminal} from "../../../../duck/terminal/terminal.selector";

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
  isInline?: boolean;
  saleModal?: boolean;
  setSaleModal?: (state: boolean) => void;
}

export const CloseSaleInline: FC<Props> = ({
                                             added,
                                             setAdded,
                                             discount,
                                             tax,
                                             finalTotal,
                                             setDiscount,
                                             setTax,
                                             setDiscountAmount,
                                             paymentTypesList,
                                             subTotal,
                                             taxTotal,
                                             couponTotal,
                                             discountTotal,
                                             customer,
                                             setCustomer,
                                             discountAmount,
                                             refundingFrom,
                                             setRefundingFrom,
                                             discountRateType,
                                             setDiscountRateType,
                                             isInline,
                                             saleModal,
                                             setSaleModal
                                           }) => {
  const {register, handleSubmit, watch, reset, control, getValues, setFocus} = useForm();
  const [isSaleClosing, setSaleClosing] = useState(false);
  const [payment, setPayment] = useState<PaymentType>();
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [hold, setHold] = useState(false);
  const [quickCashOperation, setQuickCashOperation] = useState<'add' | 'subtract' | 'exact'>('exact');
  const [quickCashItems, setQuickCashItems] = useState<number[]>([5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1]);

  const store = useSelector(getStore);
  const terminal = useSelector(getTerminal);

  const alert = useAlert();

  const resetFields = () => {
    setAdded([]);
    setCustomer(undefined);
    if(setRefundingFrom) {
      setRefundingFrom!(undefined);
    }
    if(setSaleModal) {
      setSaleModal!(false);
    }
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
    let paymentsAdded: OrderPayment[] = [...payments];
    setSaleClosing(true);
    if(payments.length === 0){
      paymentsAdded = [{
        received: finalTotal,
        type: payment,
        total: finalTotal,
        due: 0
      }];
    }
    try {
      const formValues: any = {
        items: added,
        discount: discount,
        tax: tax,
        taxAmount: taxTotal,
        payments: paymentsAdded,
        customerId: customer?.id,
        discountAmount: discountTotal,
        discountRateType: discountRateType,
        refundingFrom: refundingFrom,
        notes: values.notes,
        store: store?.id,
        total: finalTotal,
        terminal: terminal?.id
      };

      if (hold) {
        formValues['isSuspended'] = true;
      }

      const response = await jsonRequest(ORDER_CREATE, {
        method: 'POST',
        body: JSON.stringify(formValues)
      });

      const json = await response.json();

      resetFields();
      setPayments([]);

      if(!hold) {
        //print the order
        PrintOrder(json.order);
      }

    } catch (e) {
      if (e instanceof UnprocessableEntityException) {
        const res: ValidationResult = await e.response.json();

        const message = res.errorMessage;
        const messages = res.violations.map(validation => {
          return `${validation.message}`
        });

        if (message) {
          alert.error(message);
        }

        if (messages.length > 0) {
          alert.error(messages.join(', '));
        }
      }

      throw e;
    } finally {
      setSaleClosing(false);
    }
  };

  const changeDue = useMemo(() => {
    //get a total of payments
    if(payments.length === 0){
      return Number(watch('received')) - finalTotal;
    }

    return payments.reduce((prev, current) => Number(prev) + Number(current.received), 0) - finalTotal;
  }, [payments, finalTotal, watch('received')]);

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
    if (payments.length === 0 && saleModal) {
      localforage.getItem('defaultPaymentType').then((data: any) => {
        if (data !== null) {
          addSplitPayment(finalTotal, data);
        }
      });
    }
  }, [saleModal]);

  const received = useMemo(() => {
    return Number(payments.reduce((prev, current) => Number(prev) + Number(current.received), 0))
  }, [payments]);

  useEffect(() => {
    reset({
      received: finalTotal.toFixed(2)
    });
  }, [finalTotal]);

  const addQuickCash = useCallback((item: number, cashOperation?: string) => {
    let method = cashOperation || quickCashOperation;

    if (method === 'exact') {
      addSplitPayment(item, payment);
    } else if (method === 'add') {
      addSplitPayment(item, payment);
    } else if (method === 'subtract') {
      addSplitPayment(-item, payment);
    }
  }, [quickCashOperation, reset, finalTotal, payments, payment]);

  const shortcutHandler = useCallback((e: Event) => {
    //open sale modal
    if (added.length > 0) {
      if(setSaleModal) {
        setSaleModal!(true);
      }
    }

    if (saleModal) {
      //close sale
      onSaleSubmit(getValues());
    }

    if(isInline){
      onSaleSubmit(getValues());
    }
  }, [
    added, saleModal, payments, hold, tax, customer, discount,
    finalTotal, discountTotal, discountRateType, refundingFrom, getValues, isInline, payment
  ]);

  const addSplitPayment = (amount: number, payment?: PaymentType) => {
    if (amount === 0) {
      alert.error('Amount cannot be zero');

      return false;
    }

    if (!payment?.canHaveChangeDue && (amount + received) > finalTotal) {
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

  const focusAmountField = () => {
    setFocus('received', {
      shouldSelect: true
    });
  };

  return (
    <>
      <div className="mb-5">
        <div className="grid grid-cols-6 gap-4">
          <div className={classNames(
            isInline ? "col-span-6" : 'col-span-4'
          )}>
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
                    changeDue < 0 ? 'text-rose-500' : ' text-teal-500'
                  )
                }>
                  {changeDue < 0 ? 'Receivable' : 'Change Due'}
                </th>
                <td className={
                  classNames(
                    `border border-gray-300 p-2 text-right text-4xl font-bold`,
                    changeDue < 0 ? 'text-rose-500' : ' text-teal-500'
                  )
                }>
                  {changeDue.toFixed(2)}
                </td>
              </tr>
            </OrderTotals>
          </div>
          {!isInline && (
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
                  <Button className="w-full btn-warning relative" size="lg" key={item}
                          onClick={() => addQuickCash(item)}>
                    {item}
                    {getQuickCashCounter(item) > 0 && (
                      <span className="quick-cash-badge">{getQuickCashCounter(item)}</span>
                    )}
                  </Button>
                ))}
                <Button className="w-full btn-primary" size="lg" key={finalTotal}
                        onClick={() => addQuickCash(finalTotal, 'exact')}>{finalTotal.toFixed(2)}</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <ScrollContainer horizontal className="scroll-container flex gap-3 mb-3" vertical={false}>
          {paymentTypesList.map((pt, index) => {
            return (
              <Button
                key={index}
                onClick={() => {
                  setPayment(pt);
                }}
                className="btn-primary flex-grow flex-shrink-0 w-auto"
                active={payment?.id === pt.id}
                type="button"
                size="lg"
                disabled={pt.type === 'credit' && (customer === undefined || customer === null)}
              >
                {pt.name}
                <Shortcut shortcut={`alt+p+${index}`} handler={() => {
                  if(pt.type === 'credit' && (customer === undefined || customer === null)){
                    return false;
                  }

                  setPayment(pt)
                }} />
              </Button>
            );
          })}
        </ScrollContainer>
      </div>
      <form onSubmit={handleSubmit(onSaleSubmit)}>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="mb-3">
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
                          id="amount"
                          placeholder="Payment"
                          className="w-full flex-1 lg input mousetrap"
                          selectable={true}
                          ref={props.field.ref}
                          onKeyDown={(e) => {
                            if(e.key === 'Enter'){
                              e.preventDefault();

                              addSplitPayment(Number(watch('received')), payment);

                              return false;
                            }
                          }}
                          tabIndex={0}
                        />
                      </>
                    )
                  }}
                  defaultValue={finalTotal}
                />

                <Shortcut shortcut="ctrl+enter" handler={() => focusAmountField()} invisible={true}/>

                <Button type="button" className="btn-secondary lg"
                        onClick={() => addSplitPayment(Number(watch('received')), payment)}
                        disabled={added.length === 0}
                        tabIndex={-1}
                >
                  <FontAwesomeIcon icon={faPlus}/>
                </Button>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="notes">Notes</label>
              <Textarea {...register('notes')} id="notes" tabIndex={-1}/>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button className="btn-success w-full"
                      type="submit" disabled={added.length === 0 || isSaleClosing || changeDue < 0}
                      size="lg"
                      tabIndex={0}
              >
                {isSaleClosing ? '...' : 'Complete'}
                <Shortcut shortcut="ctrl+s" handler={shortcutHandler}/>
              </Button>

              <Button
                type="submit"
                disabled={added.length === 0 || isSaleClosing}
                size="lg"
                className="btn-warning flex-1"
                onClick={() => setHold(true)}
              >
                {isSaleClosing ? '...' : 'Hold'}
              </Button>
              <div className="flex-1">
                <ClearSale
                  added={added}
                  setAdded={setAdded}
                  setDiscount={setDiscount}
                  setTax={setTax}
                  setDiscountAmount={setDiscountAmount}
                />
              </div>
            </div>
          </div>
          <ScrollContainer horizontal={false} className={
            classNames(
              isInline ? 'flex gap-y-2 flex-col' : 'grid grid-cols-2 gap-y-3'
            )
          } vertical={true}>
            {payments.map((item, index) => (
              <div className="grid grid-cols-3 gap-3" key={index}>
                <div>{item?.type?.name}</div>
                <div>{item.received}</div>
                <div>
                  <button className="btn btn-danger" type="button" onClick={() => removeSplitPayment(index)}>
                    <FontAwesomeIcon icon={faTrash}/>
                  </button>
                </div>
              </div>
            ))}
          </ScrollContainer>
        </div>
      </form>
    </>
  );
};
