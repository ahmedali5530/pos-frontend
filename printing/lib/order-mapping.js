'use strict';

/**
 * Map Order (from src/api/model/order.ts) plain object to print-builder shapes.
 * Order: { id, order_id, created_at, items, discount, tax, payments, customer, user, store, terminal, notes, adjustment, ... }
 * OrderItem: { id, product (Product), variant (ProductVariant), quantity, price, is_deleted, is_returned, is_suspended, taxes, taxes_total, discount, ... }
 */

function getOrderId(order) {
  if (!order) return '';
  const orderId = order.order_id != null ? order.order_id : (order.id ? String(order.id).split(':').pop() : '');
  return String(orderId || '');
}

/**
 * Filter order items: exclude deleted, returned, suspended.
 * @param {Object} order
 * @returns {Array<{ name, qty, price, total, notes }>}
 */
function getOrderItems(order) {
  if (!order || !Array.isArray(order.items)) return [];
  return order.items
    .filter((it) => !it.is_deleted && it.is_returned !== true && it.is_suspended !== true)
    .map((it) => {
      const product = it.product || {};
      const variant = it.variant;
      
      // Product name: use variant name if available, otherwise product name
      let name = '';
      if (variant && variant.name) {
        name = variant.name;
      } else if (product && product.name) {
        name = product.name;
        // Append variant name if it's different from product name
        if (variant && variant.name && variant.name !== product.name) {
          name = `${product.name} - ${variant.name}`;
        }
      }
      
      const qty = it.quantity != null ? it.quantity : 1;
      const price = it.price != null ? Number(it.price) : 0;
      const total = price * qty;
      const notes = order.notes || '';
      return { name, qty, price, total, notes };
    });
}

/**
 * Delivery charges - not available in new model, return 0.
 */
function getOrderDeliveryCharges(order) {
  return 0;
}

function getOrderTaxLabel(order) {
  if (!order || !order.tax) return 'Tax';
  const tax = order.tax;
  const taxType = tax.type || {};
  const name = taxType.name || 'Tax';
  const rate = tax.rate != null ? tax.rate : (taxType.rate != null ? taxType.rate : null);
  return rate != null ? `${name} ${rate}%` : name;
}

/**
 * Service charge label - not available in new model.
 */
function getOrderServiceChargeLabel(order) {
  return '';
}

/**
 * User display name from order.user.display_name.
 */
function getOrderUserName(order) {
  if (!order || !order.user) return '';
  return String(order.user.display_name || '');
}

/**
 * Payment summary. change = sum(payment.received) - total.
 * @param {Object} order
 * @param {number} total - bill total
 * @returns {{ payments: Array<{ method, amount }>, paymentsSum: number, change: number }}
 */
function getOrderPaymentSummary(order, total) {
  const payTotal = Number(total || 0);
  if (!order) return { payments: [], paymentsSum: 0, change: -payTotal };
  const ps = order.payments || [];
  const payments = ps.map((p) => {
    const paymentType = p.type || {};
    const method = paymentType.name || 'Payment';
    // Use received amount, fallback to total
    const amount = Number(p.received != null ? p.received : (p.total != null ? p.total : 0));
    return { method, amount };
  });
  const paymentsSum = payments.reduce((s, p) => s + p.amount, 0);
  const change = paymentsSum - payTotal;
  return { payments, paymentsSum, change };
}

/**
 * Totals calculation:
 * itemsTotal = sum of (item.price * item.quantity)
 * discountAmount = order.discount.amount or 0
 * tax = order.tax.amount or sum of item.taxes_total
 * total = itemsTotal - discountAmount + tax + adjustment
 */
function getOrderTotals(order) {
  const items = getOrderItems(order);
  const itemsTotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
  
  // Discount amount from order.discount
  let discountAmount = 0;
  if (order.discount) {
    if (order.discount.amount != null) {
      discountAmount = Number(order.discount.amount);
    } else if (order.discount.rate != null && order.discount.type) {
      // Calculate discount from rate if type is percent
      const discountType = order.discount.type;
      if (discountType.rate_type === 'percent' || discountType.rate_type === 'Percent') {
        discountAmount = itemsTotal * (Number(order.discount.rate) / 100);
      } else {
        discountAmount = Number(order.discount.rate);
      }
    }
  }
  
  // Tax amount from order.tax or sum of item taxes
  let tax = 0;
  if (order.tax && order.tax.amount != null) {
    tax = Number(order.tax.amount);
  } else {
    // Sum taxes from items
    tax = (order.items || []).reduce((s, it) => s + Number(it.taxes_total || 0), 0);
  }
  
  // Adjustment (can be positive or negative)
  const adjustment = Number(order.adjustment || 0);
  
  const service = 0; // Not available in new model
  const deliveryCharges = getOrderDeliveryCharges(order);
  const total = itemsTotal - discountAmount + tax + adjustment;
  const totalWithDelivery = total + deliveryCharges;
  
  return { itemsTotal, discountAmount, extrasTotal: 0, tax, service, deliveryCharges, total, totalWithDelivery };
}

/**
 * For final receipt: single string of payment methods and amounts.
 * @param {Object} order
 * @returns {string}
 */
function getOrderPaymentsString(order) {
  if (!order || !Array.isArray(order.payments) || order.payments.length === 0) return '';
  return order.payments
    .map((p) => {
      const paymentType = p.type || {};
      const method = paymentType.name || 'Payment';
      const amount = Number(p.received != null ? p.received : (p.total != null ? p.total : 0));
      return `${method}: ${amount.toFixed(2)}`;
    })
    .join(', ');
}

/**
 * Table display - not available in new model.
 */
function getOrderTable(order) {
  return '';
}

/**
 * @param {Object} order
 * @returns {string}
 */
function getOrderDeliveryAddress(order) {
  if (!order || !order.customer) return '';
  return order.customer.address || '';
}

/**
 * @param {Object} order
 * @returns {string}
 */
function getOrderPhone(order) {
  if (!order || !order.customer) return '';
  const p = order.customer.phone;
  return p != null ? String(p) : '';
}

/**
 * @param {Object} order
 * @returns {string}
 */
function getOrderDeliveryNotes(order) {
  if (!order) return '';
  return order.notes || '';
}

/**
 * Date to match _common.bill: 'y-MM-dd hh:mm a' (e.g. 2026-01-17 11:52 PM).
 */
function getOrderDate(order) {
  const d = order && order.created_at ? (order.created_at instanceof Date ? order.created_at : new Date(order.created_at)) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const am = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${y}-${m}-${day} ${String(h12).padStart(2, '0')}:${min} ${am}`;
}

/**
 * @param {Object} order
 * @returns {string} - time for kitchen
 */
function getOrderCreatedAt(order) {
  if (!order || !order.created_at) return new Date().toLocaleTimeString();
  const d = order.created_at;
  return d instanceof Date ? d.toLocaleTimeString() : new Date(d).toLocaleTimeString();
}

/**
 * @param {Object} order
 * @returns {string}
 */
function getOrderPriority(order) {
  // Not available in new model
  return '';
}

/**
 * Common bill shape aligned with _common.bill.tsx and final.bill.tsx.
 * @param {Object} order
 * @param {{ forDelivery?: boolean }} opts - forDelivery: use totalWithDelivery and include deliveryCharges in total
 */
function mapOrderToBill(order, opts) {
  const tot = getOrderTotals(order);
  const forDelivery = opts && opts.forDelivery;
  const total = forDelivery ? tot.totalWithDelivery : tot.total;
  const pay = getOrderPaymentSummary(order, total);
  const items = getOrderItems(order);
  return {
    orderId: getOrderId(order),
    table: getOrderTable(order),
    date: getOrderDate(order),
    userName: getOrderUserName(order),
    items,
    itemsCount: items.length,
    itemsTotal: tot.itemsTotal,
    discount: !!order.discount,
    discountAmount: tot.discountAmount,
    tax: tot.tax,
    taxLabel: getOrderTaxLabel(order),
    serviceChargeLabel: getOrderServiceChargeLabel(order),
    serviceChargeAmount: tot.service,
    extras: [],
    tipAmount: 0,
    tipLabel: 'Tip',
    deliveryCharges: tot.deliveryCharges,
    total,
    payments: pay.payments,
    change: pay.change,
  };
}

/**
 * Temp: Pre-Sale Bill style (CommonBillParts only, no payments/change). Matches presale.bill.tsx.
 */
function mapOrderToTemp(order) {
  return { ...mapOrderToBill(order, { forDelivery: false }), title: 'Pre-Sale Bill', note: '' };
}

/**
 * Final: Final Bill + CommonBillParts + payments + Change. Matches final.bill.tsx.
 */
function mapOrderToFinal(order, options) {
  const dup = options && options.duplicate;
  return {
    ...mapOrderToBill(order, { forDelivery: false }),
    title: dup ? 'Duplicate Final Bill' : 'Final Bill',
    thankYou: 'Thank you!',
  };
}

/**
 * Delivery: CommonBillParts + Delivery line + address/phone/notes + payments + Change.
 */
function mapOrderToDelivery(order) {
  return {
    ...mapOrderToBill(order, { forDelivery: true }),
    title: 'DELIVERY',
    address: getOrderDeliveryAddress(order),
    phone: getOrderPhone(order),
    notes: getOrderDeliveryNotes(order),
  };
}

/**
 * Map Order -> kitchen shape: { orderId, table, items, createdAt, priority }
 */
function mapOrderToKitchen(order) {
  return {
    orderId: getOrderId(order),
    table: getOrderTable(order),
    items: getOrderItems(order),
    createdAt: getOrderCreatedAt(order),
    priority: getOrderPriority(order),
  };
}

/**
 * Items from a refund order (selected items only, no filtering). Matches refund.bill.tsx.
 * @param {Object} order - refund order with items
 * @returns {Array<{ name, qty, price, total }>}
 */
function getRefundOrderItems(order) {
  if (!order || !Array.isArray(order.items)) return [];
  return order.items.map((it) => {
    const product = it.product || {};
    const variant = it.variant;
    
    let name = '';
    if (variant && variant.name) {
      name = variant.name;
    } else if (product && product.name) {
      name = product.name;
      if (variant && variant.name && variant.name !== product.name) {
        name = `${product.name} - ${variant.name}`;
      }
    }
    
    const qty = it.quantity != null ? it.quantity : 1;
    const price = it.price != null ? Number(it.price) : 0;
    const total = price * qty;
    return { name, qty, price, total };
  });
}

/**
 * Map refund order + originalOrder to refund receipt shape. Matches refund.bill.tsx.
 * data: { order: refundOrder, originalOrder }
 * refundOrder has: items (selected), tax, discount, adjustment.
 */
function mapOrderToRefund(refundOrder, originalOrder) {
  const items = getRefundOrderItems(refundOrder);
  const itemsTotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
  
  // Calculate amounts similar to getOrderTotals
  let taxAmount = 0;
  if (refundOrder.tax && refundOrder.tax.amount != null) {
    taxAmount = Number(refundOrder.tax.amount);
  } else {
    taxAmount = (refundOrder.items || []).reduce((s, it) => s + Number(it.taxes_total || 0), 0);
  }
  
  let discountAmount = 0;
  if (refundOrder.discount) {
    if (refundOrder.discount.amount != null) {
      discountAmount = Number(refundOrder.discount.amount);
    } else if (refundOrder.discount.rate != null && refundOrder.discount.type) {
      const discountType = refundOrder.discount.type;
      if (discountType.rate_type === 'percent' || discountType.rate_type === 'Percent') {
        discountAmount = itemsTotal * (Number(refundOrder.discount.rate) / 100);
      } else {
        discountAmount = Number(refundOrder.discount.rate);
      }
    }
  }
  
  const adjustment = Number(refundOrder.adjustment || 0);
  const total = itemsTotal - discountAmount + taxAmount + adjustment;
  const orig = originalOrder || refundOrder;
  const serviceChargeLabel = getOrderServiceChargeLabel(refundOrder);
  
  return {
    originalOrderId: getOrderId(orig),
    refundDate: new Date().toLocaleString(),
    items,
    itemsCount: items.length,
    itemsTotal,
    tax: taxAmount,
    taxLabel: getOrderTaxLabel(refundOrder),
    discount: !!refundOrder.discount,
    discountAmount,
    serviceChargeLabel,
    serviceChargeAmount: 0,
    extras: [],
    tipAmount: 0,
    tipLabel: 'Tip',
    total,
  };
}

module.exports = {
  getOrderId,
  getOrderItems,
  getOrderTotals,
  getOrderPaymentsString,
  getOrderTable,
  getOrderDeliveryAddress,
  getOrderPhone,
  getOrderDeliveryNotes,
  getOrderDate,
  getOrderCreatedAt,
  getOrderPriority,
  mapOrderToTemp,
  mapOrderToFinal,
  mapOrderToDelivery,
  mapOrderToKitchen,
  getRefundOrderItems,
  mapOrderToRefund,
};
