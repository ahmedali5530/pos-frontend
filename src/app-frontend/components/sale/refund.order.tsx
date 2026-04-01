import React, {FC, useMemo, useState} from "react";
import {Button} from "../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {Tooltip} from "antd";
import {Modal} from "../../../app-common/components/modal/modal";
import {Controller, useForm} from "react-hook-form";
import {Input} from "../../../app-common/components/input/input";
import {Order, ORDER_FETCHES} from "../../../api/model/order";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import {notify} from "../../../app-common/components/confirm/notification";
import {PaymentType} from "../../../api/model/payment.type";
import {withCurrency} from "../../../lib/currency/currency";
import {useAtom} from "jotai";
import {defaultState} from "../../../store/jotai";
import {CartItem} from "../../../api/model/cart.item";

interface RefundItemLine {
  orderItemId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  originalQuantity: number;
  price: number;
  discount: number;
  taxesRate: number;
  taxes: any[];
  product: any;
  variant?: any;
}

interface Props {
  title: string;
  variant: string;
  icon: IconProp;
  displayLabel?: boolean;
  active?: boolean;
  paymentTypesList: PaymentType[];
}

export const RefundOrder: FC<Props> = ({
  title,
  variant,
  icon,
  displayLabel,
  active,
  paymentTypesList
}) => {
  const db = useDB();
  const [{disableEdit}, setAppState] = useAtom(defaultState);
  const [findModal, setFindModal] = useState(false);
  const [refundModal, setRefundModal] = useState(false);
  const [isFinding, setIsFinding] = useState(false);
  const [order, setOrder] = useState<Order>();
  const [items, setItems] = useState<RefundItemLine[]>([]);
  const [paymentTypeId, setPaymentTypeId] = useState<string>();
  const {control, handleSubmit, reset} = useForm();

  const availablePaymentTypes = useMemo(() => {
    return paymentTypesList.filter((type) => {
      return type.is_active && type.type !== "card" && type.type !== "credit";
    });
  }, [paymentTypesList]);

  const onFindOrder = async (values: any) => {
    setIsFinding(true);
    try {
      const [orders] = await db.query(
        `SELECT * FROM ${Tables.order}
         WHERE order_id = $orderId and is_deleted != true and status = "Completed" LIMIT 1 FETCH ${ORDER_FETCHES.join(", ")}`,
        {orderId: Number(values.order_id)}
      );

      if (orders.length === 0) {
        notify({
          title: "Not found",
          description: "Order not found",
          type: "error",
          placement: "top",
        });
        return;
      }

      const selectedOrder = orders[0] as Order;
      const refundLines = selectedOrder.items
        .filter((item) => !item.is_deleted && !item.is_returned && Number(item.quantity) > 0)
        .map((item) => ({
          orderItemId: item.id,
          productName: item.product?.name || "-",
          variantName: item.variant?.attribute_value,
          quantity: Number(item.quantity),
          originalQuantity: Number(item.quantity),
          price: Number(item.price),
          discount: Number(item.discount || 0),
          taxesRate: item.taxes.reduce((total, tax) => total + Number(tax.rate), 0),
          taxes: item.taxes,
          product: item.product,
          variant: item.variant
        }));

      if (refundLines.length === 0) {
        notify({
          type: "error",
          description: "No refundable items left in this order",
          placement: "top",
        });
        return;
      }

      if (availablePaymentTypes.length === 0) {
        notify({
          type: "error",
          description: "No active refund payment type found",
          placement: "top",
        });
        return;
      }

      setOrder(selectedOrder);
      setItems(refundLines);
      setPaymentTypeId(availablePaymentTypes[0].id);
      setFindModal(false);
      setRefundModal(true);
    } finally {
      setIsFinding(false);
    }
  };

  const updateItemQuantity = (orderItemId: string, value: string) => {
    const qty = Number(value);
    setItems((prev) => {
      return prev.map((item) => {
        if (item.orderItemId !== orderItemId) {
          return item;
        }

        const nextQty = Number.isFinite(qty) ? qty : item.quantity;
        return {
          ...item,
          quantity: Math.max(0, Math.min(item.originalQuantity, nextQty))
        };
      });
    });
  };

  const removeItem = (orderItemId: string) => {
    setItems((prev) => prev.filter((item) => item.orderItemId !== orderItemId));
  };

  const lineTotals = useMemo(() => {
    return items.map((item) => {
      const itemSubtotal = Number(item.quantity) * Number(item.price);
      const itemTax = (itemSubtotal * Number(item.taxesRate || 0)) / 100;
      const discountPerUnit = item.originalQuantity > 0 ? Number(item.discount || 0) / Number(item.originalQuantity) : 0;
      const lineDiscount = discountPerUnit * Number(item.quantity);
      const lineTotal = itemSubtotal + itemTax - lineDiscount;
      return {
        ...item,
        itemTax,
        lineDiscount,
        lineTotal
      };
    });
  }, [items]);

  const totals = useMemo(() => {
    return lineTotals.reduce((acc, line) => {
      acc.subTotal += Number(line.price) * Number(line.quantity);
      acc.tax += Number(line.itemTax);
      acc.discount += Number(line.lineDiscount);
      acc.total += Number(line.lineTotal);
      return acc;
    }, {
      subTotal: 0,
      tax: 0,
      discount: 0,
      total: 0
    });
  }, [lineTotals]);

  const onConfirmRefund = () => {
    if (!order) {
      return;
    }

    const hasInvalidQuantity = items.some((item) => {
      const quantity = Number(item.quantity);
      return !Number.isFinite(quantity) || quantity <= 0 || quantity > Number(item.originalQuantity);
    });

    if (hasInvalidQuantity) {
      notify({
        type: "error",
        description: "Invalid quantity found. Keep quantity greater than 0 and not more than original quantity, or remove the item.",
      });
      return;
    }

    const selectedItems = lineTotals.filter((line) => Number(line.quantity) > 0);
    if (selectedItems.length === 0) {
      notify({
        type: "error",
        description: "Select at least one item quantity greater than zero",
      });
      return;
    }

    const selectedPayment = availablePaymentTypes.find((item) => item.id === paymentTypeId);
    if (!selectedPayment) {
      notify({
        type: "error",
        description: "Select a payment type",
      });
      return;
    }

    const refundCartItems: CartItem[] = selectedItems.map((line) => {
      const unitDiscount = line.originalQuantity > 0 ? Number(line.discount) / Number(line.originalQuantity) : 0;
      return {
        quantity: -1 * Number(line.quantity),
        price: Number(line.price),
        discount: unitDiscount * Number(line.quantity),
        variant: line.variant,
        item: line.product,
        taxes: line.taxes,
        taxIncluded: true,
        sourceOrderItemId: line.orderItemId,
        refundMaxQuantity: line.originalQuantity
      };
    });

    setAppState((prev) => ({
      ...prev,
      added: refundCartItems,
      refundingItems: refundCartItems,
      refundingSourceItems: selectedItems.map((item) => ({
        orderItemId: item.orderItemId,
        quantity: Number(item.quantity),
        originalQuantity: Number(item.originalQuantity)
      })),
      discount: undefined,
      discountAmount: undefined,
      tax: undefined,
      customer: order.customer,
      refundingFrom: order.id,
      refundPaymentType: selectedPayment,
      disableEdit: true
    }));

    setRefundModal(false);
    setOrder(undefined);
    setItems([]);
    reset({
      order_id: ""
    });
  };

  return (
    <>
      <Tooltip title={title}>
        <Button
          variant={variant}
          type="button"
          onClick={() => setFindModal(true)}
          size="lg"
          active={active}
          disabled={disableEdit}>
          <FontAwesomeIcon icon={icon} className={displayLabel ? "mr-2" : ""}/>
          {displayLabel && title}
        </Button>
      </Tooltip>

      <Modal
        open={findModal}
        title={title}
        onClose={() => {
          setFindModal(false);
          reset({order_id: ""});
        }}
        shouldCloseOnEsc
        size="sm">
        <form onSubmit={handleSubmit(onFindOrder)}>
          <div className="input-group w-full">
            <Controller
              render={({field}) => (
                <Input
                  placeholder="Search by Order#"
                  value={field.value}
                  onChange={field.onChange}
                  className="search-field flex-1"
                  autoFocus
                  type="number"
                />
              )}
              name="order_id"
              control={control}
              defaultValue=""
            />
            <Button type="submit" variant="primary" className="w-28" disabled={isFinding}>
              {isFinding ? "Finding..." : "Find"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={refundModal}
        title={`Refund order# ${order?.order_id || ""}`}
        onClose={() => setRefundModal(false)}
        >
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="border border-gray-300 p-3 rounded">
            <div className="text-sm text-gray-600">Customer</div>
            <div className="font-bold">{order?.customer?.name || "Cash Sale"}</div>
          </div>
          <div className="border border-gray-300 p-3 rounded">
            <div className="text-sm text-gray-600">Order tax</div>
            <div className="font-bold">{withCurrency(order?.tax?.amount || 0)}</div>
          </div>
          <div className="border border-gray-300 p-3 rounded">
            <div className="text-sm text-gray-600">Order discount</div>
            <div className="font-bold">{withCurrency(order?.discount?.amount || 0)}</div>
          </div>
          <div className="border border-gray-300 p-3 rounded">
            <div className="text-sm text-gray-600">Adjustment</div>
            <div className="font-bold">{withCurrency(order?.adjustment || 0)}</div>
          </div>
          <div className="border border-primary-500 p-3 rounded bg-primary-50">
            <div className="text-sm text-gray-600">Refund total</div>
            <div className="font-bold text-xl">-{withCurrency(totals.total)}</div>
          </div>
        </div>

        <table className="table border border-collapse mb-4">
          <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-right w-[130px]">Qty</th>
            <th className="text-right">Price</th>
            <th className="text-right">Tax</th>
            <th className="text-right">Discount</th>
            <th className="text-right">Total</th>
            <th className="text-right w-[110px]">Action</th>
          </tr>
          </thead>
          <tbody>
          {lineTotals.map((line) => (
            <tr key={line.orderItemId}>
              <td>
                {line.productName}
                {line.variantName ? <div className="text-xs text-gray-500">{line.variantName}</div> : null}
              </td>
              <td className="text-right">
                <Input
                  type="number"
                  value={line.quantity}
                  min={0}
                  max={line.originalQuantity}
                  className="w-full text-right"
                  onChange={(event) => updateItemQuantity(line.orderItemId, event.currentTarget.value)}
                />
                <div className="text-xs text-gray-500">max {line.originalQuantity}</div>
              </td>
              <td className="text-right">{withCurrency(line.price)}</td>
              <td className="text-right">{withCurrency(line.itemTax)}</td>
              <td className="text-right">{withCurrency(line.lineDiscount)}</td>
              <td className="text-right">{withCurrency(line.lineTotal)}</td>
              <td className="text-right">
                <Button
                  type="button"
                  variant="danger"
                  className="btn-sm"
                  onClick={() => removeItem(line.orderItemId)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>

        <div className="mb-4">
          <label className="block mb-2">Payment type</label>
          <select
            className="input w-full"
            value={paymentTypeId || ""}
            onChange={(event) => setPaymentTypeId(event.currentTarget.value)}>
            {availablePaymentTypes.map((type) => (
              <option key={type.id.toString()} value={type.id.toString()}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <Button variant="success" type="button" className="flex-1" onClick={onConfirmRefund}>
            Confirm
          </Button>
          <Button variant="danger" type="button" className="flex-1" onClick={() => setRefundModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};
