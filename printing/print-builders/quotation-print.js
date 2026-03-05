'use strict';

const { normalizeConfig, printReceiptHeader } = require('../lib/receipt-helpers');
const { printBillLayout } = require('../lib/bill-layout');
const { mapOrderToFinal } = require('../lib/order-mapping');

/**
 * Quotation print - same as final layout, but without payment and change details.
 * Expects data: { order: OrderLike, notes?: string }.
 */
function build(printer, data = {}, config = {}) {
  const order = data && data.order;
  if (!order) {
    return Promise.reject(new Error('data.order is required for quotation print'));
  }

  const cfg = normalizeConfig(config);
  const bill = {
    ...mapOrderToFinal(order, { duplicate: false }),
    title: 'Quotation',
  };

  return printReceiptHeader(printer, cfg).then(() => {
    return printBillLayout(printer, bill, cfg, {
      title: bill.title,
      qrcode: data.qrcode,
      thankYou: '',
      notes: data.notes || order.description,
      showPayments: false,
      showChange: false,
      showDeliveryLine: false,
      isFinal: false,
      customerName: order.customer?.name,
    }).then(() => printer);
  });
}

module.exports = { build };
