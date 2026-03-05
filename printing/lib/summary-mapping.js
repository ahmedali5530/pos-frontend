'use strict';

const { calculateOrderItemPricePrint } = require('./order-mapping');

const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Filtered items (exclude deleted, refunded, suspended). Mirrors getOrderFilteredItems.
 */
function getFilteredItems(order) {
  if (!order || !Array.isArray(order.items)) return [];
  return order.items.filter(
    (it) => !it.is_deleted && !it.is_returned
  );
}

/**
 * Item line total including modifiers (mirrors calculateOrderItemPrice).
 */
function itemLineTotal(it) {
  return safeNumber(calculateOrderItemPricePrint(it));
}

/**
 * Voided items (deleted, refunded, or suspended).
 */
function getVoidedItems(order) {
  if (!order || !Array.isArray(order.items)) return [];
  return order.items.filter(
    (it) => it.is_deleted || it.is_returned
  );
}

/**
 * Compute summary from { orders: Order[], date } to match Summary (summary.tsx) props and logic.
 * @param {{ orders?: unknown[], date?: string }} props - same as Summary props
 * @returns {Object} flat summary for printing
 */
function computeSummary(props) {
  const orders = Array.isArray(props?.orders) ? props.orders : [];
  const date = props?.date || new Date().toLocaleDateString();

  // Sale price without tax (items total, using price*quantity)
  const salePriceWithoutTax = orders.reduce((sum, order) => {
    return (
      sum +
      getFilteredItems(order).reduce((itemSum, item) => itemSum + safeNumber(itemLineTotal(item)), 0)
    );
  }, 0);
  const exclusive = salePriceWithoutTax;

  const taxCollected = orders.reduce((s, o) => s + safeNumber(o.tax && o.tax.amount), 0);
  const serviceCharges = 0;

  const itemDiscounts = orders.reduce((s, order) => {
    return (
      s +
      safeNumber(
        (order.items || []).reduce((itemSum, item) => itemSum + safeNumber(item?.discount), 0)
      )
    );
  }, 0);

  const subtotalDiscounts = orders.reduce((s, order) => {
    return s + safeNumber(order.discount && order.discount.amount);
  }, 0);
  const discounts = itemDiscounts + subtotalDiscounts;

  const totalExtras = 0;

  const adjustment = orders.reduce((s, o) => s + safeNumber(o.adjustment), 0);

  const amountDue = salePriceWithoutTax + taxCollected + serviceCharges + totalExtras - itemDiscounts - subtotalDiscounts + adjustment;
  const amountCollected = orders.reduce((s, order) => {
    return (
      s +
      (order.payments || []).reduce((ps, p) => ps + safeNumber(p?.total), 0)
    );
  }, 0);
  const rounding = amountCollected - amountDue;
  const net = amountCollected - serviceCharges - taxCollected;

  const refunds = orders.reduce((s, order) => {
    if (order.status === 'Deleted' || order.status === 'Returned') {
      return (
        s +
        (order.payments || []).reduce((ps, p) => {
          const a = safeNumber(p?.total);
          return ps + Math.abs(Math.min(0, a));
        }, 0)
      );
    }
    return (
      s +
      (order.payments || []).reduce((ps, p) => {
        const a = safeNumber(p?.total);
        return ps + (a < 0 ? Math.abs(a) : 0);
      }, 0)
    );
  }, 0);

  const gross = amountCollected + refunds + discounts;
  const gSales = salePriceWithoutTax;

  const tips = 0;

  const discountsList = {};
  orders.forEach((order) => {
    if (order?.discount) {
      const k = (order.discount.type && order.discount.type.name) || 'Discount';
      if (!discountsList[k]) discountsList[k] = 0;
      discountsList[k] += safeNumber(order.discount.amount);
    }
  });

  const taxesList = {};
  orders.forEach((order) => {
    if (order?.tax) {
      const k = `${(order.tax.type && order.tax.type.name) || 'Tax'} ${order.tax.rate ?? ''}`.trim();
      if (!taxesList[k]) taxesList[k] = 0;
      taxesList[k] += safeNumber(order.tax.amount);
    }
  });

  const paymentTypes = {};
  orders.forEach((order) => {
    (order.payments || []).forEach((p) => {
      const name = (p.type && p.type.name) || 'Unknown';
      if (!paymentTypes[name]) paymentTypes[name] = 0;
      paymentTypes[name] += safeNumber(p.total);
    });
  });

  const extras = {};

  const voids = orders.reduce((s, order) => {
    return (
      s +
      getVoidedItems(order).reduce((itemSum, item) => itemSum + safeNumber(itemLineTotal(item)), 0)
    );
  }, 0);

  const covers = 0;
  const ordersCount = orders.length;
  const averageCover = covers > 0 ? amountDue / covers : 0;
  const averageOrder = ordersCount > 0 ? amountDue / ordersCount : 0;

  const categories = {};
  orders.forEach((order) => {
    getFilteredItems(order).forEach((item) => {
      const cats = item.product?.categories;
      const cat = (Array.isArray(cats) && cats.length > 0) ? (cats[0].name || '') : '';
      if (!cat) return;
      if (!categories[cat]) categories[cat] = { quantity: 0, total: 0 };
      categories[cat].quantity += item.quantity ?? 1;
      categories[cat].total += itemLineTotal(item);
    });
  });

  const dishes = {};
  orders.forEach((order) => {
    getFilteredItems(order).forEach((item) => {
      const name = item.product?.name || '';
      if (!name) return;
      if (!dishes[name]) dishes[name] = { quantity: 0, total: 0 };
      dishes[name].quantity += item.quantity ?? 1;
      dishes[name].total += itemLineTotal(item);
    });
  });

  return {
    date,
    exclusive,
    gSales,
    gross,
    refunds,
    serviceCharges,
    discounts,
    taxes: taxCollected,
    net,
    amountDue,
    amountCollected,
    totalExtras,
    rounding,
    voids,
    tips,
    covers,
    ordersCount,
    averageCover,
    averageOrder,
    discountsList,
    taxesList,
    paymentTypes,
    extras,
    categories,
    dishes,
  };
}

function formatNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? String(Math.round(x)) : '0';
}

module.exports = { computeSummary, formatNum, getFilteredItems, getVoidedItems, itemLineTotal };
