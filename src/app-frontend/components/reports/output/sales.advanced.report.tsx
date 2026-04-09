import {useEffect, useMemo, useRef, useState} from "react";
import {useDB} from "../../../../api/db/db";
import {Order, ORDER_FETCHES, OrderStatus} from "../../../../api/model/order";
import {Tables} from "../../../../api/db/tables";
import {formatNumber, withCurrency} from "../../../../lib/currency/currency";
import {ReportsLayout} from "../../../containers/layout/reports.layout";
import {useOrder} from "../../../../api/hooks/use.order";
import {toRecordId} from "../../../../api/model/common";

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const recordToString = (value: any): string => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && 'toString' in value) {
    return value.toString();
  }
  return String(value);
};

interface ReportFilters {
  startDate?: string | null;
  endDate?: string | null;
  cashierIds: string[];
  terminalIds: string[];
  storeIds: string[];
  withTax?: boolean;
  withoutTax?: boolean;
  withDiscount?: boolean;
  withoutDiscount?: boolean;
  discountIds: string[];
  taxIds: string[];
  paymentTypeIds: string[];
  refund?: boolean;
  completed?: boolean;
  cancelled?: boolean;
  onHold?: boolean;
  pending?: boolean;
  showMenuItems?: boolean;
  showDetails?: boolean;
}

const parseFilters = (): ReportFilters => {
  const params = new URLSearchParams(window.location.search);
  const parseMulti = (name: string) => {
    const list = [
      ...params.getAll(`${name}[]`),
      ...params.getAll(name),
    ].filter(Boolean);
    return list as string[];
  };

  return {
    startDate: params.get('start') || params.get('start_date'),
    endDate: params.get('end') || params.get('end_date'),
    cashierIds: parseMulti('cashiers'),
    terminalIds: parseMulti('terminals'),
    storeIds: parseMulti('stores'),
    withTax: params.has('with_tax'),
    withoutTax: params.has('without_tax'),
    withDiscount: params.has('with_discount'),
    withoutDiscount: params.has('without_discount'),
    discountIds: parseMulti('discounts'),
    taxIds: parseMulti('taxes'),
    paymentTypeIds: parseMulti('payment_types'),
    completed: params.has('completed'),
    refund: params.has('returned'),
    cancelled: params.has('deleted'),
    onHold: params.has('on_hold'),
    pending: params.has('pending'),
    showMenuItems: params.has('show_order_items'),
    showDetails: params.has('show_details'),
  };
};

export const SalesAdvancedReport = () => {
  const db = useDB();
  const orderHook = useOrder();

  const queryRef = useRef(db.query);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(parseFilters, []);
  const subtitle = filters.startDate && filters.endDate ? `${filters.startDate} to ${filters.endDate}` : undefined;

  useEffect(() => {
    queryRef.current = db.query;
  }, [db]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const orderConditions: string[] = [];
        const params: Record<string, string | string[]> = {};

        if (filters.startDate) {
          orderConditions.push(`time::format(created_at, "${import.meta.env.VITE_REPORTS_DATE_PARSE}") >= $startDate`);
          params.startDate = filters.startDate;
        }

        if (filters.endDate) {
          orderConditions.push(`time::format(created_at, "${import.meta.env.VITE_REPORTS_DATE_PARSE}") <= $endDate`);
          params.endDate = filters.endDate;
        }

        const statusConditions: string[] = [];
        if (filters.refund) {
          statusConditions.push(`status = '${OrderStatus.RETURNED}'`);
        }
        if (filters.completed) {
          statusConditions.push(`status = '${OrderStatus.COMPLETED}'`);
        }
        if (filters.cancelled) {
          statusConditions.push(`status = '${OrderStatus.DELETED}'`);
        }
        if (filters.onHold) {
          statusConditions.push(`status = '${OrderStatus.ON_HOLD}'`);
        }
        if (filters.pending) {
          statusConditions.push(`status = '${OrderStatus.PENDING}'`);
        }

        // If specific status filters are set, use them; otherwise include all statuses
        if (statusConditions.length > 0) {
          orderConditions.push(`(${statusConditions.join(' OR ')})`);
        }

        if (filters.storeIds.length > 0) {
          orderConditions.push(`store INSIDE $stores`);
          params.stores = filters.storeIds.map(item => toRecordId(item));
        }

        if (filters.terminalIds.length > 0) {
          orderConditions.push(`terminal INSIDE $terminals`);
          params.terminals = filters.terminalIds.map(item => toRecordId(item));
        }

        if (filters.cashierIds.length > 0) {
          orderConditions.push(`user INSIDE $cashiers`);
          params.cashiers = filters.cashierIds.map(item => toRecordId(item));
        }

        if (filters.discountIds.length > 0) {
          orderConditions.push(`discount.type.id INSIDE $discounts`);
          params.discounts = filters.discountIds.map(item => toRecordId(item));
        }

        if (filters.taxIds.length > 0) {
          orderConditions.push(`tax.type.id INSIDE $taxes`);
          params.taxes = filters.taxIds.map(item => toRecordId(item));
        }

        if (filters.paymentTypeIds.length > 0) {
          const paymentFilter = [];
          filters.paymentTypeIds.forEach((pt, index) => {
            paymentFilter.push(`array::any(payments.type.id, $payment${index})`);
            params[`payment${index}`] = toRecordId(pt);
          })

          orderConditions.push(`(${paymentFilter.join(' or ')})`);
        }

        const ordersQuery = `
            SELECT *
            FROM ${Tables.order} ${orderConditions.length ? `WHERE ${orderConditions.join(" AND ")}` : ""}
            order by created_at asc
                FETCH ${ORDER_FETCHES.join(', ')}
        `;

        const ordersResult: any = await queryRef.current(ordersQuery, params);
        setOrders((ordersResult?.[0] ?? []) as Order[]);
      } catch (err) {
        console.error("Failed to load sales advanced report", err);
        setError(err instanceof Error ? err.message : "Unable to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filters.startDate,
    filters.endDate,
    filters.refund,
    filters.completed,
    filters.cancelled,
    filters.pending,
    filters.onHold,
    filters.cashierIds,
    filters.terminalIds,
    filters.storeIds,
    filters.discountIds,
    filters.taxIds,
    filters.paymentTypeIds
  ]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filter by tax
      const hasTax = safeNumber(order.tax?.amount) > 0;
      if (filters.withTax && !hasTax) {
        return false;
      }
      if (filters.withoutTax && hasTax) {
        return false;
      }

      // Filter by discount
      const hasDiscount = safeNumber(order.discount?.amount) > 0;
      if (filters.withDiscount && !hasDiscount) {
        return false;
      }
      if (filters.withoutDiscount && hasDiscount) {
        return false;
      }

      return true;
    });
  }, [orders, filters]);

  const calculateOrderTotals = (order: Order) => {
    const salePriceWithoutTax = safeNumber(
      order.items?.reduce((sum, item) => {
        return sum + orderHook.calculateOrderItemPrice(item) - orderHook.itemTaxes(item);
      }, 0) ?? 0
    );
    const lineDiscounts = safeNumber(
      order.items?.reduce((sum, item) => sum + safeNumber(item?.discount), 0) ?? 0
    );
    const orderDiscount = safeNumber(order.discount?.amount);
    const couponDiscount = 0;
    const subtotalDiscount = Math.max(0, safeNumber(orderDiscount - lineDiscounts));
    const totalDiscounts = safeNumber(lineDiscounts + subtotalDiscount);
    const taxes = safeNumber(order.tax?.amount);
    const serviceCharges = 0;
    const amountDue = safeNumber(salePriceWithoutTax + taxes + serviceCharges - totalDiscounts - couponDiscount);
    const amountCollected = safeNumber(
      order.payments?.reduce((sum, payment) => sum + safeNumber(payment?.total), 0) ?? 0
    );
    const net = safeNumber(amountCollected - serviceCharges - taxes);

    // Calculate payment types wise total
    const payments: Record<string, number> = {};
    order.payments?.forEach(payment => {
      const paymentTypeName = payment.type?.name || 'Unknown';
      const paymentTotal = safeNumber(payment.total);
      payments[paymentTypeName] = (payments[paymentTypeName] || 0) + paymentTotal;
    });

    return {
      salePriceWithoutTax,
      taxes,
      amountDue,
      serviceCharges,
      discounts: totalDiscounts,
      coupons: couponDiscount,
      net,
      amountCollected,
      payments
    };
  };

  const totals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        const orderTotals = calculateOrderTotals(order);
        acc.salePriceWithoutTax += orderTotals.salePriceWithoutTax;
        acc.taxes += orderTotals.taxes;
        acc.amountDue += orderTotals.amountDue;
        acc.serviceCharges += orderTotals.serviceCharges;
        acc.discounts += orderTotals.discounts;
        acc.coupons += orderTotals.coupons;
        acc.net += orderTotals.net;
        acc.amountCollected += orderTotals.amountCollected;
        acc.ordersCount += 1;

        // Aggregate payment type totals
        Object.entries(orderTotals.payments).forEach(([type, amount]) => {
          acc.payments[type] = (acc.payments[type] || 0) + amount;
        });

        return acc;
      },
      {
        salePriceWithoutTax: 0,
        taxes: 0,
        amountDue: 0,
        serviceCharges: 0,
        discounts: 0,
        coupons: 0,
        net: 0,
        amountCollected: 0,
        ordersCount: 0,
        payments: {} as Record<string, number>,
      }
    );
  }, [filteredOrders]);

  if (loading) {
    return (
      <ReportsLayout title="Sales Advanced Report" subtitle={subtitle}>
        <div className="py-12 text-center text-neutral-500">Loading sales advanced report…</div>
      </ReportsLayout>
    );
  }

  if (error) {
    return (
      <ReportsLayout title="Sales Advanced Report" subtitle={subtitle}>
        <div className="py-12 text-center text-danger-600">Failed to load report: {error}</div>
      </ReportsLayout>
    );
  }

  return (
    <ReportsLayout title="Sales Advanced Report" subtitle={subtitle}>
      <div className="space-y-8">
        {/* Summary Totals */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Summary</h3>
          <div className="p-4">
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="py-2 text-neutral-700">Total Orders</td>
                <td className="py-2 text-right font-semibold text-neutral-900">{formatNumber(totals.ordersCount)}</td>
              </tr>
              <tr>
                <td className="py-2 text-neutral-700">Sale Price w/o Tax</td>
                <td
                  className="py-2 text-right font-semibold text-neutral-900">{withCurrency(totals.salePriceWithoutTax)}</td>
              </tr>
              <tr>
                <td className="py-2 text-neutral-700">Taxes</td>
                <td className="py-2 text-right font-semibold text-neutral-900">{withCurrency(totals.taxes)}</td>
              </tr>
              <tr>
                <td className="py-2 text-neutral-700">Discounts</td>
                <td className="py-2 text-right font-semibold text-danger-600">{withCurrency(-totals.discounts)}</td>
              </tr>
              <tr>
                <td className="py-2 text-neutral-700">Amount Due</td>
                <td className="py-2 text-right font-semibold text-neutral-900">{withCurrency(totals.amountDue)}</td>
              </tr>
              <tr>
                <td className="py-2 text-neutral-700">Amount Collected</td>
                <td
                  className="py-2 text-right font-semibold text-neutral-900">{withCurrency(totals.amountCollected)}</td>
              </tr>
              <tr className="border-t-2 border-neutral-300">
                <td className="py-2 font-semibold text-neutral-900">Net</td>
                <td className="py-2 text-right font-bold text-neutral-900">{withCurrency(totals.net)}</td>
              </tr>
              {Object.keys(totals.payments).length > 0 && (
                <>
                  <tr className="border-t border-neutral-200">
                    <td className="py-2 font-semibold text-neutral-700" colSpan={2}>Payment Breakdown</td>
                  </tr>
                  {Object.entries(totals.payments).map(([type, amount]) => (
                    <tr key={type}>
                      <td className="py-2 text-neutral-600 pl-4">{type}</td>
                      <td className="py-2 text-right text-neutral-700">{withCurrency(amount)}</td>
                    </tr>
                  ))}
                </>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <h3 className="bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-700">Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
              <tr>
                <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-neutral-700">Date</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Invoice #</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Cashier</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Terminal</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Store</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-neutral-700">Status</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Sale w/o Tax</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Taxes</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Discounts</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Amount Due</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Amount Collected</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Net</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-neutral-700">Payments</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
              {filteredOrders.map(order => {
                const orderTotals = calculateOrderTotals(order);
                const orderDate = new Date(order.created_at);
                const dateStr = orderDate.toLocaleDateString();
                const cashierName = order.user ? `${order.user.display_name}` || 'Unknown' : 'Unknown';
                const terminalName = order.terminal?.code ? order.terminal.code : `-`;
                const storeName = order.store?.name || 'Unknown';
                const discountName = order.discount?.type?.name || (orderTotals.discounts > 0 ? 'Custom' : 'None');
                const hasItems = filters.showMenuItems && order.items && order.items.length > 0;

                return (
                  <>
                    <tr key={order.id} className={hasItems ? 'border-b-0' : ''}>
                      <td className="py-3 pl-6 pr-3 text-sm text-neutral-700">{dateStr}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{order.order_id}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{cashierName}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{terminalName}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">{storeName}</td>
                      <td className="py-3 px-3 text-sm text-neutral-700">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.status === OrderStatus.COMPLETED ? 'bg-success-100 text-success-800' :
                              order.status === OrderStatus.DELETED ? 'bg-danger-100 text-danger-800' :
                                order.status === OrderStatus.RETURNED ? 'bg-warning-100 text-warning-800' :
                                  order.status === OrderStatus.PENDING ? 'bg-warning-100 text-warning-800' :
                                    order.status === OrderStatus.ON_HOLD ? 'bg-warning-100 text-warning-800' :
                                      'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-neutral-700">{withCurrency(orderTotals.salePriceWithoutTax)}</td>
                      <td className="py-3 px-3 text-right text-sm text-neutral-700">{withCurrency(orderTotals.taxes)}</td>
                      <td className="py-3 px-3 text-right text-sm text-danger-600">{withCurrency(-orderTotals.discounts)}</td>
                      <td className="py-3 px-3 text-right text-sm text-neutral-700">{withCurrency(orderTotals.amountDue)}</td>
                      <td className="py-3 px-3 text-right text-sm text-neutral-700">{withCurrency(orderTotals.amountCollected)}</td>
                      <td className="py-3 px-3 text-right text-sm font-semibold text-neutral-900">{withCurrency(orderTotals.net)}</td>
                      <td className="py-2 pl-2 text-right font-semibold text-neutral-900 text-sm">
                        {Object.keys(orderTotals.payments).length > 0 && (
                          <>
                            {Object.entries(orderTotals.payments).map(([type, amount]) => (
                              <div key={type} className="">
                                <span className="text-neutral-600">{type}:</span>
                                <span className="font-semibold text-neutral-900">{withCurrency(amount)}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </td>
                    </tr>
                    {
                      hasItems && (
                        <tr key={`${order.id}-items`}>
                          <td colSpan={13} className="py-3 pl-6 pr-6 bg-neutral-100">
                            <div className="space-y-2">
                              {/*<div className="text-xs font-semibold text-neutral-700 mb-2">Items:</div>*/}
                              <table className="table table-hover table-sm w-full text-xs">
                                <thead>
                                <tr className="border-b border-neutral-200">
                                  <th className="text-left py-2 pr-4 font-semibold text-neutral-600">Item</th>
                                  <th className="text-right py-2 px-2 font-semibold text-neutral-600">Quantity</th>
                                  <th className="text-right py-2 px-2 font-semibold text-neutral-600">Price</th>
                                  <th className="text-right py-2 px-2 font-semibold text-neutral-600">Discount</th>
                                  <th className="text-right py-2 pl-2 font-semibold text-neutral-600">Total</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                {order.items.map((item, idx) => {
                                  const itemPrice = orderHook.calculateOrderItemPrice(item);
                                  const itemDiscount = safeNumber(item.discount);
                                  const itemTotal = safeNumber(itemPrice) - itemDiscount;

                                  return (
                                    <tr key={`${order.id}-item-${idx}`}>
                                      <td className="py-2 pr-4 text-neutral-700">
                                        {item.product?.name || 'Unknown'}
                                        {item.variant && (
                                          <>({item.variant.attribute_value})</>
                                        )}
                                      </td>
                                      <td className="py-2 px-2 text-right text-neutral-700">{formatNumber(item.quantity)}</td>
                                      <td className="py-2 px-2 text-right text-neutral-700">{withCurrency(itemPrice)}</td>
                                      <td className="py-2 px-2 text-right text-danger-600">{withCurrency(-itemDiscount)}</td>
                                      <td className="py-2 pl-2 text-right font-semibold text-neutral-900">{withCurrency(itemTotal)}</td>
                                    </tr>
                                  );
                                })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )
                    }
                  </>
                )
                  ;
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-6 text-center text-sm text-neutral-500">
                    No orders found for the selected filters.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ReportsLayout>
  );
};