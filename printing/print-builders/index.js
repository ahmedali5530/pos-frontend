'use strict';

const tempPrint = require('./temp-print');
const summaryPrint = require('./summary-print');
const deliveryPrint = require('./delivery-print');
const finalPrint = require('./final-print');
const refundPrint = require('./refund-print');
const deletionPrint = require('./deletion-print');
const tablePrint = require('./table-print');
const quotationPrint = require('./quotation-print');

const BUILDERS = {
  temp: tempPrint,
  summary: summaryPrint,
  delivery: deliveryPrint,
  final: finalPrint,
  quotation: quotationPrint,
  refund: refundPrint,
  deletion: deletionPrint,
  table: tablePrint,
};

/**
 * Get print builder by type.
 * @param {string} type - 'temp' | 'summary' | 'kitchen' | 'delivery' | 'final' | 'quotation' | 'refund' | 'deletion' | 'table'
 * @returns {{ build: (printer, data) => Promise<Printer> }}
 */
function getBuilder(type) {
  const b = BUILDERS[type];
  if (!b) {
    throw new Error(`Unknown print type: ${type}. Use: temp, summary, kitchen, delivery, final, quotation, refund, deletion, table`);
  }
  return b;
}

module.exports = {
  getBuilder,
  temp: tempPrint,
  summary: summaryPrint,
  delivery: deliveryPrint,
  final: finalPrint,
  quotation: quotationPrint,
  refund: refundPrint,
  deletion: deletionPrint,
  table: tablePrint,
};
