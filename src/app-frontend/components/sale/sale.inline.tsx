import {Button} from "../../../app-common/components/input/button";
import React, {FC, useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {OrderTotals} from "../cart/order.totals";
import {Textarea} from "../../../app-common/components/input/textarea";
import {Controller, useForm} from "react-hook-form";
import {PaymentType} from "../../../api/model/payment.type";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPause, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {AddedPayment} from "../../../api/model/order.payment";
import {UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import {ValidationResult} from "../../../lib/validator/validation.result";
import {Shortcut} from "../../../app-common/components/input/shortcut";
import {ClearSale} from "./clear.sale";
import ScrollContainer from "react-indiana-drag-scroll";
import {PrintOrder} from "./sale.print";
import {notify} from "../../../app-common/components/confirm/notification";
import {formatNumber, withCurrency} from "../../../lib/currency/currency";
import {useAtom} from "jotai";
import {CartItemType} from "../cart/cart.container";
import {appState as AppState, defaultData, defaultState, PosModes} from "../../../store/jotai";
import {discountTotal, finalTotal, taxTotal} from "../../containers/dashboard/pos";
import {OrderStatus} from "../../../api/model/order";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import {useOrder} from "../../../api/hooks/use.order";
import {toRecordId} from "../../../api/model/common";
import {Order} from "../../../api/model/order";
import {dispatchPrint} from "../../../lib/print/print.service";
import {nanoid} from "nanoid";

interface Props {
  paymentTypesList: PaymentType[];
  isInline?: boolean;
  saleModal?: boolean;
  setSaleModal?: (state: boolean) => void;
  onSale?: () => void;
  customerInput?: any
}

export const CloseSaleInline: FC<Props> = ({
  paymentTypesList,
  isInline,
  saleModal,
  setSaleModal,
  onSale,
  customerInput
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

  const {register, handleSubmit, watch, reset, control, getValues} =
    useForm();

  const [defaultAppState, setDefaultAppState] = useAtom(defaultData);
  const [appSt] = useAtom(AppState);
  const {store, terminal, user} = appSt;
  const db = useDB();
  const orderHook = useOrder();

  const {defaultMode, defaultDiscount, defaultPaymentType, defaultTax, requireCustomerBox} =
    defaultAppState;

  const [isSaleClosing, setSaleClosing] = useState(false);
  const [payment, setPayment] = useState<PaymentType>();
  const [payments, setPayments] = useState<AddedPayment[]>([]);
  const [hold, setHold] = useState(false);
  const [quickCashOperation, setQuickCashOperation] = useState<
    "add" | "subtract" | "exact"
  >("exact");
  const [quickCashItems, setQuickCashItems] = useState<number[]>([
    5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1,
  ]);


  const resetFields = () => {
    setAppState((prev) => ({
      ...prev,
      added: [],
      customer: undefined,
      adjustment: 0,
      refundingFrom: undefined,
      customerName: '',
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

    if (typeof setSaleModal === 'function') {
      setSaleModal(false);
    }
    reset({
      received: undefined,
    });

    if (defaultPaymentType) {
      setPayment(defaultPaymentType);
    } else {
      setPayment(undefined);
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

    setHold(false);
  };

  const nextOrderId = async () => {
    const [numbers] = await db.query(`SELECT math::max(order_id) as order_id
                                      from ${Tables.order}
                                      group all`);
    if (numbers.length > 0) {
      return numbers[0].order_id;
    }

    return 0;
  }

  const getProjectedCreditSale = (addedPayments: AddedPayment[]) => {
    return addedPayments.reduce((total, current) => {
      if (current?.type?.type === "credit") {
        return total + Number(current.received || 0);
      }

      return total;
    }, 0);
  };

  const getCustomerOutstanding = (customerData: any) => {
    const creditSales = (customerData?.orders || []).reduce((saleTotal: number, order: any) => {
      const orderCreditSale = (order?.payments || []).reduce((paymentTotal: number, payment: any) => {
        if (payment?.type?.type === "credit") {
          return paymentTotal + Number(payment.received || 0);
        }
        return paymentTotal;
      }, 0);

      return saleTotal + orderCreditSale;
    }, 0);

    const customerPayments = (customerData?.payments || []).reduce((paymentTotal: number, payment: any) => {
      return paymentTotal + Number(payment?.amount || 0);
    }, 0);

    return creditSales - customerPayments + Number(customerData?.opening_balance ?? 0);
  };

  const ensureCustomerCreditLimit = async (customerData: any, projectedCreditSale: number) => {
    if (!customerData?.id) {
      return true;
    }

    const creditLimit = Number(customerData?.credit_limit);
    if (!Number.isFinite(creditLimit) || creditLimit <= 0) {
      return true;
    }

    const [rows] = await db.query(
      `SELECT * FROM ONLY ${toRecordId(customerData.id)} FETCH payments, orders, orders.payments, orders.payments.type`
    );
    const customerWithHistory = rows;
    if (!customerWithHistory) {
      return true;
    }

    const outstanding = getCustomerOutstanding(customerWithHistory);
    const projectedOutstanding = outstanding + Number(projectedCreditSale || 0);

    if (projectedOutstanding > creditLimit) {
      notify({
        type: "error",
        description: `Credit limit exceeded. Limit: ${withCurrency(creditLimit)}, projected outstanding: ${withCurrency(projectedOutstanding)}`
      });
      return false;
    }

    return true;
  };

  const onSaleSubmit = async (values: any) => {
    if(defaultMode === PosModes.quote){
      if (requireCustomerBox && !customerName) {
        notify({
          type: "error",
          description: 'Add customer name',
        });

        customerInput?.current?.focus();
        return;
      }

      try {
        setSaleClosing(true);

        let printers = [];

        const [settings] = await db.query(`SELECT * FROM ${Tables.setting} where terminal = $terminal and name = $name FETCH values.printers.printers`, {
          name: 'final_printers',
          terminal: toRecordId(terminal?.id)
        });

        if(settings.length > 0 && settings[0].values.printers.length > 0){
          printers = settings[0].values.printers;
        }

        const quoteOrder = {
          order_id: `Q-${nanoid(5)}`,
          created_at: new Date(),
          customer: customer ?? (customerName ? {name: customerName} : undefined),
          user,
          adjustment,
          description: values.notes,
          discount: discount ? {
            amount: discountAmount,
            rate: discount.rate,
            type: discount
          } : null,
          tax: tax ? {
            amount: taxTotal(added),
            rate: tax.rate,
            type: tax
          } : null,
          payments: [],
          items: added.map((item) => ({
            product: item.item,
            price: Number(item.price),
            quantity: Number(item.quantity),
            discount: Number(item.discount || 0),
            taxes: item.taxes,
            variant: item.variant,
            is_deleted: false,
            is_returned: false
          }))
        };

        await dispatchPrint(db, 'quotation', {
          order: quoteOrder,
          notes: values.notes
        }, {
          userId: user?.id,
          printers: printers
        });

        onSale && onSale();
        resetFields();
        setPayments([]);
      } finally {
        setSaleClosing(false);
      }
      return;
    }

    let paymentsAdded: AddedPayment[] = [...payments];
    if (requireCustomerBox && !customerName && defaultMode !== PosModes.payment) {
      notify({
        type: "error",
        description: 'Add customer name',
      });

      customerInput?.current?.focus();
      return;
    }

    let order;

    try {
      setSaleClosing(true);

      let customerFromDB = null;
      if (customer) {
        [[customerFromDB]] = await db.query(`SELECT * FROM ${toRecordId(customer.id)}`);
      }

      if (customerName) {
        [customerFromDB] = await db.insert(Tables.customer, {
          name: customerName,
        });
      }

      if (paymentsAdded.length === 0) {
        paymentsAdded = [
          {
            received: values.received,
            type: payment,
            total: ft + adjustment,
            due: changeDue,
          },
        ];
      }

      const orderWillBeCompleted = defaultMode !== PosModes.order && !hold;
      if (orderWillBeCompleted) {
        const projectedCreditSale = getProjectedCreditSale(paymentsAdded);
        const creditAllowed = await ensureCustomerCreditLimit(customerFromDB, projectedCreditSale);
        if (!creditAllowed) {
          return;
        }
      }

      // add items
      const items = [];
      for (const add of added) {
        const [item] = await db.insert(Tables.order_product, {
          discount: add.discount,
          is_deleted: false,
          is_returned: false,
          is_suspended: false,
          price: Number(add.price),
          product: toRecordId(add.item.id),
          quantity: Number(add.quantity),
          taxes: add.taxes.map(item => toRecordId(item.id)),
          variant: add.variant ? toRecordId(add.variant.id) : null
        });

        items.push(item.id);

        // if variant, then only cut variant quantity
        if(add.variant) {
          const [variantStore] = await db.query(`SELECT * FROM ${Tables.product_variant_store} where store = $store and variant = $variant`, {
            store: toRecordId(store?.id),
            variant: toRecordId(add.variant.id)
          });

          if (variantStore.length > 0) {
            await db.merge(toRecordId(variantStore[0].id), {
              quantity: variantStore[0].quantity - Number(add.quantity)
            });
          }
        }else{
          // update product stock
          const [productStore] = await db.query(`SELECT * FROM ${Tables.product_store} where store = $store and product = $product`, {
            store: toRecordId(store?.id),
            product: toRecordId(add.item.id)
          });

          if(productStore.length > 0){
            await db.merge(toRecordId(productStore[0].id), {
              quantity: productStore[0].quantity - Number(add.quantity)
            });
          }
        }
      }

      let orderDiscount = null;
      if (discount) {
        [orderDiscount] = await db.insert(Tables.order_discount, {
          amount: Number(discountAmount),
          rate: discount.rate,
          rate_type: discount.rate_type,
          type: toRecordId(discount.id)
        });
      }

      let orderTax = null;
      if (tax) {
        [orderTax] = await db.insert(Tables.order_tax, {
          amount: Number(taxTotal(added, tax)),
          rate: tax.rate,
          type: toRecordId(tax.id)
        });
      }

      const order_id = await nextOrderId();

      const orderPayments = [];
      for (const op of paymentsAdded) {
        const [{id}] = await db.insert(Tables.order_payment, {
          due: Number(op.due),
          received: Number(op.received),
          total: Number(op.total),
          type: op.type ? toRecordId(op.type.id) : null
        });

        orderPayments.push(id);
      }

      const formValues: any = {
        adjustment: adjustment,
        customer: customerFromDB ? toRecordId(customerFromDB?.id) : null,
        description: values.notes,
        discount: orderDiscount ? toRecordId(orderDiscount.id) : null,
        items: items,
        order_id: (order_id ?? 0) + 1,
        payments: orderPayments,
        returned_from: refundingFrom ? toRecordId(refundingFrom) : null,
        store: toRecordId(store?.id ?? ''),
        tax: orderTax ? toRecordId(orderTax?.id) : null,
        terminal: toRecordId(terminal?.id ?? ''),
        user: user ? toRecordId(user.id) : null,
      };

      if (hold) {
        formValues["is_suspended"] = true;
      }

      if (defaultMode === PosModes.order) {
        formValues["status"] = OrderStatus.PENDING;
      } else {
        if (hold) {
          formValues["status"] = OrderStatus.ON_HOLD;
        } else {
          formValues["status"] = OrderStatus.COMPLETED;
        }
      }


      if (orderId) {
        await db.merge(toRecordId(orderId), {
          ...formValues
        });

        order = await orderHook.fetchOrder(toRecordId(orderId).toString());
      } else {
        const [o] = await db.insert(Tables.order, {
          ...formValues
        });

        order = await orderHook.fetchOrder(o.id.toString());
      }

      for (const item of items) {
        await db.merge(toRecordId(item), {
          order: toRecordId(order.id)
        });
      }

      // update customer account
      if(customerFromDB){
        await db.merge(toRecordId(customerFromDB.id), {
          orders: [...customerFromDB.orders, toRecordId(order.id)]
        })
      }

      resetFields();
      setPayments([]);
    } catch (e) {
      if (e instanceof UnprocessableEntityException) {
        const res: ValidationResult = await e.response.json();

        const message = res.errorMessage;
        const messages = res.violations.map((validation) => {
          return `${validation.message}`;
        });

        if (message) {
          notify({
            type: "error",
            description: message,
          });
        }

        if (messages.length > 0) {
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

    if ('id' in order && order.status === OrderStatus.COMPLETED) {
      onSale && onSale();

      let printers = [];

      const [settings] = await db.query(`SELECT * FROM ${Tables.setting} where terminal = $terminal and name = $name FETCH values.printers.printers`, {
        name: 'final_printers',
        terminal: toRecordId(terminal?.id)
      });

      if(settings.length > 0 && settings[0].values.printers.length > 0){
        printers = settings[0].values.printers;
      }

      //print the order
      await dispatchPrint(db, 'final', {
        order: order
      }, {
        userId: user?.id,
        printers: printers
      });
    }
  };

  const changeDue = useMemo(() => {
    //get a total of payments
    if (payments.length === 0) {
      return Number((Number(watch("received")) - ft - adjustment));
    }

    return Number((
      payments.reduce(
        (prev, current) => Number(prev) + Number(current.received),
        0
      ) -
      ft +
      adjustment
    ));
  }, [payments, watch("received"), adjustment]);

  useEffect(() => {
    if (payment === undefined) {
      //check for default payment
      if (defaultPaymentType) {
        setPayment(defaultPaymentType);
      } else {
        if (paymentTypesList.length > 0) {
          setPayment(paymentTypesList[0]);
        }
      }
    }
  }, [paymentTypesList, payment, saleModal]);

  useEffect(() => {
    if (payments.length === 0 && saleModal) {
      if (defaultPaymentType) {
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

      if (method === "exact") {
        addSplitPayment(item, payment);
      } else if (method === "add") {
        addSplitPayment(item, payment);
      } else if (method === "subtract") {
        addSplitPayment(-item, payment);
      }
    },
    [quickCashOperation, reset, finalTotal, payments, payment]
  );

  const shortcutHandler = useCallback(
    async (e: Event) => {
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

      if (isInline && !hasError) {
        await onSaleSubmit(getValues());

        resetFields();
        setPayments([]);
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
      customerName
    ]
  );

  const addSplitPayment = (amount: number, payment?: PaymentType) => {
    if (amount === 0) {
      notify({
        type: "error",
        description: "Amount cannot be zero",
      });

      return false;
    }

    if (!payment?.can_have_change_due && amount + received > ft) {
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

    if (adj < 5) {
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
    if (paymentInputRef.current !== null) {
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
                                if (e.key === "Enter") {
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

            {(defaultMode === PosModes.payment || defaultMode === PosModes.pos || defaultMode === PosModes.order) && (
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
            )}

            {(defaultMode === PosModes.quote) && (
              <div className="flex gap-3 flex-wrap">
                <Button
                  className="btn-warning w-full"
                  type="submit"
                  disabled={added.length === 0 || isSaleClosing || changeDue < 0}
                  size="lg"
                  tabIndex={0}>
                  {isSaleClosing ? "..." : "Print Quote"}
                  <Shortcut shortcut="ctrl+s" handler={shortcutHandler}/>
                </Button>

                <div className="flex-1">
                  <ClearSale/>
                </div>
              </div>
            )}

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
