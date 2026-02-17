'use strict';

const tempPrint = require('./temp-print');
const summaryPrint = require('./summary-print');
const deliveryPrint = require('./delivery-print');
const finalPrint = require('./final-print');
const refundPrint = require('./refund-print');

const BUILDERS = {
  temp: tempPrint,
  summary: summaryPrint,
  delivery: deliveryPrint,
  final: finalPrint,
  refund: refundPrint,
};

/**
 * Get print builder by type.
 * @param {string} type - 'temp' | 'summary' | 'delivery' | 'final' | 'refund'
 * @returns {{ build: (printer, data) => Promise<Printer> }}
 */
function getBuilder(type) {
  const b = BUILDERS[type];
  if (!b) {
    throw new Error(`Unknown print type: ${type}. Use: temp, summary, delivery, final, refund`);
  }
  return b;
}

module.exports = {
  getBuilder,
  temp: tempPrint,
  summary: summaryPrint,
  delivery: deliveryPrint,
  final: finalPrint,
  refund: refundPrint,
};
