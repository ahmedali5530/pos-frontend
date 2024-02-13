import { Button } from "../../../app-common/components/input/button";
import React, { FC, useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { OrderTotals } from "../cart/order.totals";
import { Textarea } from "../../../app-common/components/input/textarea";
import { Controller, useForm } from "react-hook-form";
import { jsonRequest } from "../../../api/request/request";
import { ORDER_CREATE, ORDER_EDIT, } from "../../../api/routing/routes/backend.app";
import { PaymentType } from "../../../api/model/payment.type";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { OrderPayment } from "../../../api/model/order.payment";
import { UnprocessableEntityException } from "../../../lib/http/exception/http.exception";
import { ValidationResult } from "../../../lib/validator/validation.result";
import { Shortcut } from "../../../app-common/components/input/shortcut";
import { ClearSale } from "./clear.sale";
import ScrollContainer from "react-indiana-drag-scroll";
import { PrintOrder } from "./sale.print";
import { useSelector } from "react-redux";
import { getStore } from "../../../duck/store/store.selector";
import { getTerminal } from "../../../duck/terminal/terminal.selector";
import { notify } from "../../../app-common/components/confirm/notification";
import { withCurrency } from "../../../lib/currency/currency";
import { useAtom } from "jotai";
import { CartItemType } from "../cart/cart.container";
import { defaultData, defaultState, PosModes } from "../../../store/jotai";
import { discountTotal, finalTotal, taxTotal } from "../../containers/dashboard/pos";
import { OrderStatus } from "../../../api/model/order";

interface Props {
  paymentTypesList: PaymentType[];
  isInline?: boolean;
  saleModal?: boolean;
  setSaleModal?: (state: boolean) => void;
  onSale?: () => void;
}

export const CloseSaleInline: FC<Props> = ({
  paymentTypesList,
  isInline,
  saleModal,
  setSaleModal,
  onSale,
}) => {
  const [appState, setAppState] = useAtom(defaultState);
  const {
    added,
    discount,
    tax,
    customer,
    refundingFrom,
    discountRateType,
    adjustment,
    orderId,
    customerName, discountAmount
  } = appState;

  const ft = finalTotal(added, tax, discountAmount, discountRateType, discount);

  const { register, handleSubmit, watch, reset, control, getValues } =
    useForm();

  const [defaultAppState, setDefaultAppState] = useAtom(defaultData);

  const { defaultMode, defaultDiscount, defaultPaymentType, defaultTax } =
    defaultAppState;

  const [isSaleClosing, setSaleClosing] = useState(false);
  const [payment, setPayment] = useState<PaymentType>();
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [hold, setHold] = useState(false);
  const [quickCashOperation, setQuickCashOperation] = useState<
    "add" | "subtract" | "exact"
  >("exact");
  const [quickCashItems, setQuickCashItems] = useState<number[]>([
    5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1,
  ]);

  const store = useSelector(getStore);
  const terminal = useSelector(getTerminal);

  const resetFields = () => {
    setAppState((prev) => ({
      ...prev,
      added: [],
      customer: undefined,
      adjustment: 0,
      refundingFrom: undefined,
      customerName: undefined,
      cartItem: undefined,
      cartItemType: CartItemType.quantity,
      latest: undefined,
      quantity: 1,
      q: "",
      orderId: undefined,
      latestQuantity: undefined,
      latestRate: undefined,
      latestVariant: undefined,
    }));

    if( typeof setSaleModal === 'function' ) {
      setSaleModal(false);
    }
    reset({
      received: undefined,
    });

    if( defaultPaymentType ) {
      setPayment(defaultPaymentType);
    } else {
      setPayment(undefined);
    }

    if( defaultDiscount ) {
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
    if( defaultTax ) {
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

    setHold(false);
  };

  const onSaleSubmit = async (values: any) => {
    let paymentsAdded: OrderPayment[] = [...payments];
    setSaleClosing(true);
    if( payments.length === 0 ) {
      paymentsAdded = [
        {
          received: values.received,
          type: payment,
          total: ft + adjustment,
          due: changeDue,
        },
      ];
    }
    try {
      const formValues: any = {
        items: added,
        discount: discount,
        tax: tax,
        taxAmount: taxTotal(added),
        payments: paymentsAdded,
        customerId: customer?.id,
        customer: customerName,
        discountAmount: discountTotal(added, tax, discountAmount, discountRateType, discount),
        discountRateType: discountRateType,
        refundingFrom: refundingFrom,
        notes: values.notes,
        store: store?.id,
        total: ft,
        terminal: terminal?.id,
        adjustment: adjustment,
      };

      if( hold ) {
        formValues["isSuspended"] = true;
      }

      if( defaultMode === PosModes.order ) {
        formValues["status"] = OrderStatus.PENDING;
      } else {
        formValues["status"] = OrderStatus.COMPLETED;
      }

      let url = ORDER_CREATE;
      let method = 'POST';
      if( orderId ) {
        url = ORDER_EDIT.replace(":id", orderId);
        method = 'PUT';
      }
      const response = await jsonRequest(url, {
        method: method,
        body: JSON.stringify(formValues),
      });

      const json = await response.json();

      resetFields();
      setPayments([]);

      // reset app state
      // setAppState((prev) => ({
      //   ...prev,
      //   cartItem: undefined,
      //   cartItemType: CartItemType.quantity,
      //   latest: undefined,
      //   quantity: 1,
      //   q: "",
      //   orderId: undefined,
      //   latestQuantity: undefined,
      //   latestRate: undefined,
      //   latestVariant: undefined,
      //   added: [],
      //   customer: undefined
      // }));

      if( json.order.status === OrderStatus.COMPLETED ) {
        onSale && onSale();
        //print the order
        PrintOrder(json.order);
      }
    } catch ( e ) {
      if( e instanceof UnprocessableEntityException ) {
        const res: ValidationResult = await e.response.json();

        const message = res.errorMessage;
        const messages = res.violations.map((validation) => {
          return `${validation.message}`;
        });

        if( message ) {
          notify({
            type: "error",
            description: message,
          });
        }

        if( messages.length > 0 ) {
          notify({
            type: "error",
            description: messages.join(", "),
          });
        }
      }

      throw e;
    } finally {
      setSaleClosing(false);
    }
  };

  const changeDue = useMemo(() => {
    //get a total of payments
    if( payments.length === 0 ) {
      return Number(watch("received")) - ft - adjustment;
    }

    return (
      payments.reduce(
        (prev, current) => Number(prev) + Number(current.received),
        0
      ) -
      ft +
      adjustment
    );
  }, [payments, watch("received"), adjustment]);

  useEffect(() => {
    if( payment === undefined ) {
      //check for default payment
      if( defaultPaymentType ) {
        setPayment(defaultPaymentType);
      } else {
        if( paymentTypesList.length > 0 ) {
          setPayment(paymentTypesList[0]);
        }
      }
    }
  }, [paymentTypesList, payment, saleModal]);

  useEffect(() => {
    if( payments.length === 0 && saleModal ) {
      if( defaultPaymentType ) {
        addSplitPayment(ft, defaultPaymentType);
      }
    }
  }, [saleModal]);

  const received = useMemo(() => {
    return Number(
      payments.reduce(
        (prev, current) => Number(prev) + Number(current.received),
        0
      )
    );
  }, [payments]);

  useEffect(() => {
    reset({
      received: (ft + adjustment).toFixed(2),
    });
  }, [adjustment, ft]);

  const addQuickCash = useCallback(
    (item: number, cashOperation?: string) => {
      let method = cashOperation || quickCashOperation;

      if( method === "exact" ) {
        addSplitPayment(item, payment);
      } else if( method === "add" ) {
        addSplitPayment(item, payment);
      } else if( method === "subtract" ) {
        addSplitPayment(-item, payment);
      }
    },
    [quickCashOperation, reset, finalTotal, payments, payment]
  );

  const shortcutHandler = useCallback(
    (e: Event) => {
      //open sale modal
      // if (added.length > 0) {
      //   if (setSaleModal) {
      //     setSaleModal!(true);
      //   }
      // }

      // if (saleModal) {
      //   //close sale
      //   onSaleSubmit(getValues());
      // }

      const hasError = changeDue < 0 || isSaleClosing || added.length === 0;

      if( isInline && !hasError ) {
        onSaleSubmit(getValues());
      }
    },
    [
      added,
      saleModal,
      payments,
      hold,
      tax,
      customer,
      discount,
      finalTotal,
      discountTotal,
      discountRateType,
      refundingFrom,
      getValues,
      isInline,
      payment,
      changeDue,
    ]
  );

  const addSplitPayment = (amount: number, payment?: PaymentType) => {
    if( amount === 0 ) {
      notify({
        type: "error",
        description: "Amount cannot be zero",
      });

      return false;
    }

    if( !payment?.canHaveChangeDue && amount + received > ft ) {
      notify({
        type: "error",
        description: `Please add exact amount for ${payment?.name}`,
      });

      return false;
    }

    const prevPayments = [...payments];
    prevPayments.push({
      total: ft,
      received: amount,
      due: amount - ft,
      type: payment,
    });

    setPayments(prevPayments);

    reset({
      received:
        ft -
        prevPayments.reduce(
          (prev, current) => Number(prev) + Number(current.received),
          0
        ),
    });
  };

  const removeSplitPayment = (item: number) => {
    const prevPayments = [...payments];

    prevPayments.splice(item, 1);

    setPayments(prevPayments);

    reset({
      received:
        ft -
        prevPayments.reduce(
          (prev, current) => Number(prev) + Number(current.received),
          0
        ),
    });
  };

  const getQuickCashCounter = (amount: number) => {
    return payments.filter((item) => Number(item.received) === amount).length;
  };

  const focusAmountField = () => {
    selectPaymentInput();
  };

  const addAdjustment = () => {
    const adj = ft % 10;

    if( adj < 5 ) {
      setAppState((prev) => ({
        ...prev,
        adjustment: -adj,
      }));
    } else {
      setAppState((prev) => ({
        ...prev,
        adjustment: 10 - adj,
      }));
    }
  };

  const canAdjust = useMemo(() => {
    return ft % 10 !== 0;
  }, []);

  const paymentInputRef = useRef<HTMLInputElement>(null);
  const selectPaymentInput = () => {
    if( paymentInputRef.current !== null ) {
      paymentInputRef.current.select();
    }
  };

  return (
    <>
      <div className="mb-5">
        <div className="grid grid-cols-6 gap-4">
          <div className={classNames(isInline ? "col-span-6" : "col-span-4")}>
            <OrderTotals
              inSale={true}>
              {!!adjustment && (
                <tr>
                  <th
                    className={classNames(
                      `border border-gray-300 p-2 text-left text-3xl font-bold digital bg-black`,
                      ft % 10 < 5
                        ? "text-danger-500"
                        : " text-success-500"
                    )}>
                    Adjustment
                  </th>
                  <td
                    className={classNames(
                      `border border-gray-300 p-2 text-right text-3xl font-bold digital bg-black`,
                      ft % 10 < 5
                        ? "text-danger-500"
                        : " text-success-500"
                    )}>
                    {withCurrency(adjustment)}
                  </td>
                </tr>
              )}
              <tr>
                <th
                  className={classNames(
                    `border border-gray-300 p-2 text-left text-3xl font-bold digital bg-black`,
                    changeDue < 0 ? "text-danger-500" : " text-success-500"
                  )}>
                  {changeDue < 0 ? "Receivable" : "Change Due"}
                </th>
                <td
                  className={classNames(
                    `border border-gray-300 p-2 text-right text-3xl font-bold digital bg-black`,
                    changeDue < 0 ? "text-danger-500" : " text-success-500"
                  )}>
                  {withCurrency(changeDue)}
                </td>
              </tr>
            </OrderTotals>
          </div>
          {!isInline && (
            <div className="col-span-2">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  className="btn-secondary"
                  size="lg"
                  active={quickCashOperation === "exact"}
                  onClick={() => setQuickCashOperation("exact")}>
                  Exact
                </Button>
                <Button
                  className="btn-secondary"
                  size="lg"
                  active={quickCashOperation === "add"}
                  onClick={() => setQuickCashOperation("add")}>
                  Add
                </Button>
                <Button
                  className="btn-secondary"
                  size="lg"
                  active={quickCashOperation === "subtract"}
                  onClick={() => setQuickCashOperation("subtract")}>
                  Subtract
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {quickCashItems.map((item) => (
                  <Button
                    className="w-full btn-warning relative"
                    size="lg"
                    key={item}
                    onClick={() => addQuickCash(item)}>
                    {item}
                    {getQuickCashCounter(item) > 0 && (
                      <span className="quick-cash-badge">
                        {getQuickCashCounter(item)}
                      </span>
                    )}
                  </Button>
                ))}
                <Button
                  className="w-full btn-primary"
                  size="lg"
                  key={ft}
                  onClick={() => addQuickCash(ft, "exact")}>
                  {ft.toFixed(2)}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {(defaultMode === PosModes.payment || defaultMode === PosModes.pos) && (
        <div>
          <ScrollContainer
            horizontal
            className="scroll-container flex gap-3 mb-3 py-3"
            vertical={false}>
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
                  disabled={
                    (pt.type === "credit" &&
                      (customer === undefined || customer === null)) ||
                    added.length === 0
                  }>
                  {pt.name}
                  {pt.type === "credit" &&
                  (customer === undefined || customer === null) ? (
                    ""
                  ) : (
                    <Shortcut
                      shortcut={`alt+p+${index}`}
                      handler={() => {
                        setPayment(pt);
                      }}
                    />
                  )}
                </Button>
              );
            })}
          </ScrollContainer>
        </div>
      )}

      <form onSubmit={handleSubmit(onSaleSubmit)}>
        <div className="grid grid-cols-2 gap-5">
          <div>
            {(defaultMode === PosModes.payment ||
              defaultMode === PosModes.pos) && (
              <>
                <div className="mb-3">
                  <div className="input-group">
                    <Controller
                      name="received"
                      control={control}
                      render={(props) => {
                        return (
                          <>
                            <input
                              ref={paymentInputRef}
                              onChange={props.field.onChange}
                              value={props.field.value}
                              type="number"
                              id="amount"
                              placeholder="Payment"
                              className="w-full flex-1 lg input mousetrap form-control"
                              onClick={selectPaymentInput}
                              onKeyDown={(e) => {
                                if( e.key === "Enter" ) {
                                  e.preventDefault();

                                  addSplitPayment(
                                    Number(watch("received")),
                                    payment
                                  );

                                  return false;
                                }
                              }}
                              disabled={added.length === 0}
                              tabIndex={0}
                            />
                          </>
                        );
                      }}
                      defaultValue={ft + adjustment}
                    />

                    <Shortcut
                      shortcut="ctrl+enter"
                      handler={() => focusAmountField()}
                      invisible={true}
                    />

                    <Button
                      type="button"
                      className="btn-secondary lg w-[48px]"
                      onClick={() =>
                        addSplitPayment(Number(watch("received")), payment)
                      }
                      disabled={added.length === 0}
                      tabIndex={-1}>
                      <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                  </div>
                </div>

                {canAdjust && (
                  <>
                    {!!adjustment ? (
                      <Button
                        type="button"
                        className="btn-danger lg w-full"
                        disabled={added.length === 0}
                        tabIndex={-1}
                        onClick={() => {
                          setAppState((prev) => ({
                            ...prev,
                            adjustment: 0,
                          }));
                        }}>
                        <FontAwesomeIcon icon={faTrash} className="mr-2"/>{" "}
                        Adjustment
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="btn-secondary lg w-full"
                        disabled={added.length === 0}
                        tabIndex={-1}
                        onClick={addAdjustment}>
                        Add Adjustment
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
            <div className="mb-3">
              <label htmlFor="notes">Notes</label>
              <Textarea
                {...register("notes")}
                className="w-full"
                id="notes"
                tabIndex={-1}
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                className="btn-success w-full"
                type="submit"
                disabled={added.length === 0 || isSaleClosing || changeDue < 0}
                size="lg"
                tabIndex={0}>
                {isSaleClosing ? "..." : "Done"}
                <Shortcut shortcut="ctrl+s" handler={shortcutHandler}/>
              </Button>

              <Button
                type="submit"
                disabled={added.length === 0 || isSaleClosing}
                size="lg"
                className="btn-warning flex-1"
                onClick={() => setHold(true)}>
                <FontAwesomeIcon icon={faPause} size="lg"/>
              </Button>
              <div className="flex-1">
                <ClearSale/>
              </div>
            </div>
          </div>
          <ScrollContainer
            horizontal={false}
            className={classNames(
              isInline ? "flex gap-y-2 flex-col" : "grid grid-cols-2 gap-y-3"
            )}
            vertical={true}>
            {payments.map((item, index) => (
              <div className="grid grid-cols-3 gap-3" key={index}>
                <div>{item?.type?.name}</div>
                <div>{item.received}</div>
                <div>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => removeSplitPayment(index)}>
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
