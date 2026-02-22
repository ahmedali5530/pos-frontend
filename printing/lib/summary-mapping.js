'use strict';

const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Filtered items (exclude deleted, returned, suspended). Mirrors getOrderItems from order-mapping.
 */
function getFilteredItems(order) {
  if (!order || !Array.isArray(order.items)) return [];
  return order.items.filter(
    (it) => !it.is_deleted && it.is_returned !== true && it.is_suspended !== true
  );
}

/**
 * Item line total. Mirrors calculateOrderItemPrice but without modifiers (price * quantity).
 */
function itemLineTotal(it) {
  return safeNumber((it.price || 0) * (it.quantity ?? 1));
}

/**
 * Voided items (deleted, returned, or suspended).
 */
function getVoidedItems(order) {
  if (!order || !Array.isArray(order.items)) return [];
  return order.items.filter(
    (it) => !!it.is_deleted || it.is_returned === true || it.is_suspended === true
  );
}

/**
 * Compute summary from { orders: { data: Order[] }, date } to match Summary (summary.tsx) props and logic.
 * @param {{ orders?: { data?: unknown[] }, date?: string }} props - same as Summary props
 * @returns {Object} flat summary for printing
 */
function computeSummary(props) {
  const orders = props?.orders?.data || [];
  const date = props?.date || new Date().toLocaleDateString();

  // Sale price without tax (items total, using price*quantity)
  const salePriceWithoutTax = orders.reduce((sum, order) => {
    return (
      sum +
      getFilteredItems(order).reduce((itemSum, item) => itemSum + safeNumber(itemLineTotal(item)), 0)
    );
  }, 0);
  const exclusive = salePriceWithoutTax;

  const taxCollected = orders.reduce((s, o) => {
    // Sum tax from order.tax.amount or from items
    if (o.tax && o.tax.amount != null) {
      return s + safeNumber(o.tax.amount);
    }
    return s + (o.items || []).reduce((itemSum, item) => itemSum + safeNumber(item?.taxes_total || 0), 0);
  }, 0);
  const serviceCharges = 0; // Not available in new model

  const itemDiscounts = orders.reduce((s, order) => {
    return (
      s +
      safeNumber(
        (order.items || []).reduce((itemSum, item) => itemSum + safeNumber(item?.discount), 0)
      )
    );
  }, 0);

  const subtotalDiscounts = orders.reduce((s, order) => {
    const lineDiscounts = (order.items || []).reduce(
      (itemSum, item) => itemSum + safeNumber(item?.discount || 0),
      0
    );
    let orderDiscount = 0;
    if (order.discount) {
      if (order.discount.amount != null) {
        orderDiscount = safeNumber(order.discount.amount);
      } else if (order.discount.rate != null && order.discount.type) {
        const discountType = order.discount.type;
        const itemsTotal = getFilteredItems(order).reduce((sum, item) => sum + itemLineTotal(item), 0);
        if (discountType.rate_type === 'percent' || discountType.rate_type === 'Percent') {
          orderDiscount = itemsTotal * (safeNumber(order.discount.rate) / 100);
        } else {
          orderDiscount = safeNumber(order.discount.rate);
        }
      }
    }
    const extraDiscount = Math.max(0, orderDiscount - lineDiscounts);
    return s + extraDiscount;
  }, 0);
  const discounts = itemDiscounts + subtotalDiscounts;

  const totalExtras = 0; // Not available in new model

  const amountDue = salePriceWithoutTax + taxCollected - itemDiscounts - subtotalDiscounts;
  const amountCollected = orders.reduce((s, order) => {
    return (
      s +
      (order.payments || []).reduce((ps, p) => ps + safeNumber(p?.received != null ? p.received : (p?.total != null ? p.total : 0)), 0)
    );
  }, 0);
  const rounding = amountCollected - amountDue;
  const net = amountCollected - taxCollected;

  const refunds = orders.reduce((s, order) => {
    if (order.status === 'Cancelled') {
      return (
        s +
        (order.payments || []).reduce((ps, p) => {
          const a = safeNumber(p?.amount);
          return ps + Math.abs(Math.min(0, a));
        }, 0)
      );
    }
    return (
      s +
      (order.payments || []).reduce((ps, p) => {
        const a = safeNumber(p?.amount);
        return ps + (a < 0 ? Math.abs(a) : 0);
      }, 0)
    );
  }, 0);

  const gross = amountCollected + refunds + discounts;
  const gSales = salePriceWithoutTax;

  const tips = 0; // Not available in new model

  const discountsList = {};
  orders.forEach((order) => {
    if (order?.discount) {
      const discountType = order.discount.type || {};
      const k = discountType.name || 'Discount';
      if (!discountsList[k]) discountsList[k] = 0;
      if (order.discount.amount != null) {
        discountsList[k] += safeNumber(order.discount.amount);
      } else if (order.discount.rate != null) {
        const itemsTotal = getFilteredItems(order).reduce((sum, item) => sum + itemLineTotal(item), 0);
        if (discountType.rate_type === 'percent' || discountType.rate_type === 'Percent') {
          discountsList[k] += itemsTotal * (safeNumber(order.discount.rate) / 100);
        } else {
          discountsList[k] += safeNumber(order.discount.rate);
        }
      }
    }
  });

  const taxesList = {};
  orders.forEach((order) => {
    if (order?.tax) {
      const taxType = order.tax.type || {};
      const taxName = taxType.name || 'Tax';
      const taxRate = taxType.rate != null ? taxType.rate : (order.tax.rate != null ? order.tax.rate : '');
      const k = `${taxName} ${taxRate}`.trim();
      if (!taxesList[k]) taxesList[k] = 0;
      if (order.tax.amount != null) {
        taxesList[k] += safeNumber(order.tax.amount);
      } else {
        taxesList[k] += (order.items || []).reduce((sum, item) => sum + safeNumber(item?.taxes_total || 0), 0);
      }
    }
  });

  const paymentTypes = {};
  orders.forEach((order) => {
    (order.payments || []).forEach((p) => {
      const paymentType = p.type || {};
      const name = paymentType.name || 'Unknown';
      if (!paymentTypes[name]) paymentTypes[name] = 0;
      paymentTypes[name] += safeNumber(p.received != null ? p.received : (p.total != null ? p.total : 0));
    });
  });

  const extras = {}; // Not available in new model

  const voids = orders.reduce((s, order) => {
    return (
      s +
      getVoidedItems(order).reduce((itemSum, item) => itemSum + safeNumber(itemLineTotal(item)), 0)
    );
  }, 0);

  const covers = orders.reduce((s, o) => s + safeNumber(o.covers), 0);
  const ordersCount = orders.length;
  const averageCover = covers > 0 ? amountDue / covers : 0;
  const averageOrder = ordersCount > 0 ? amountDue / ordersCount : 0;

  const categories = {};
  orders.forEach((order) => {
    getFilteredItems(order).forEach((item) => {
      const product = item.product || {};
      const cat = product.categories && product.categories.length > 0 
        ? (product.categories[0].name || '') 
        : '';
      if (!cat) return;
      if (!categories[cat]) categories[cat] = { quantity: 0, total: 0 };
      categories[cat].quantity += item.quantity ?? 1;
      categories[cat].total += itemLineTotal(item);
    });
  });

  const dishes = {};
  orders.forEach((order) => {
    getFilteredItems(order).forEach((item) => {
      const product = item.product || {};
      const variant = item.variant;
      const name = variant && variant.name ? variant.name : (product.name || '');
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
