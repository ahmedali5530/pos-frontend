'use strict';

/**
 * Build ZPL for bulk barcode / QR labels.
 * Bypasses escpos — returns a string, not a printer chain.
 */

function mmToDots(mm, dpi) {
  return Math.max(1, Math.round((Number(mm) || 0) * dpi / 25.4));
}

function escapeZpl(text) {
  return String(text ?? '').replace(/[\^~\\]/g, ' ');
}

function fontSize(config) {
  return config.fontSize === 'small' ? 18 : 28;
}

/**
 * @param {Object} label - { barcode, name, price, sku, category, copies }
 * @param {Object} config - Label Print settings
 * @returns {string}
 */
function buildOneLabel(label, config) {
  const dpi = Number(config.dpi) || 203;
  const width = mmToDots(config.labelWidthMm || 50, dpi);
  const height = mmToDots(config.labelHeightMm || 30, dpi);
  const margin = mmToDots(config.marginMm != null ? config.marginMm : 2, dpi);
  const fh = fontSize(config);
  const codeMode = config.codeMode || 'barcode';
  const barcode = String(label.barcode || '').trim();
  const showHR = config.showCodeHumanReadable !== false;

  let y = margin;
  const lines = [];
  lines.push('^XA');
  lines.push(`^PW${width}`);
  lines.push(`^LL${height}`);
  lines.push('^LH0,0');
  lines.push('^CI28');

  const addText = (text) => {
    if (!text) return;
    lines.push(`^FO${margin},${y}^A0N,${fh},${fh}^FD${escapeZpl(text)}^FS`);
    y += fh + 4;
  };

  if (config.showCompanyName && config.companyName) {
    addText(config.companyName);
  }
  if (config.showName && label.name) {
    addText(label.name);
  }
  if (config.showSku && label.sku) {
    addText(label.sku);
  }
  if (config.showCategory && label.category) {
    addText(label.category);
  }
  if (config.showPrice && label.price != null && label.price !== '') {
    const priceNum = Number(label.price);
    const priceStr = Number.isFinite(priceNum) ? priceNum.toFixed(2) : String(label.price);
    const sym = config.currencySymbol || '';
    addText(`${sym}${priceStr}`);
  }

  if (barcode && (codeMode === 'barcode' || codeMode === 'both')) {
    const remaining = Math.max(20, height - y - margin - (showHR ? 22 : 4));
    const barHeight = Math.min(80, remaining);
    const barcodeType = config.barcodeType || 'CODE128';

    if (barcodeType === 'EAN13') {
      lines.push(`^FO${margin},${y}^BEN,${barHeight},${showHR ? 'Y' : 'N'},N^FD${escapeZpl(barcode)}^FS`);
    } else {
      lines.push(`^BY2,2,${barHeight}`);
      lines.push(`^FO${margin},${y}^BCN,${barHeight},${showHR ? 'Y' : 'N'},N,N^FD${escapeZpl(barcode)}^FS`);
    }
    y += barHeight + (showHR ? 22 : 8);
  }

  if (barcode && (codeMode === 'qrcode' || codeMode === 'both')) {
    const avail = Math.max(40, Math.min(width - 2 * margin, height - y - margin));
    const mag = Math.max(2, Math.min(8, Math.floor(avail / 25)));
    lines.push(`^FO${margin},${y}^BQN,2,${mag}^FDQA,${escapeZpl(barcode)}^FS`);
    y += mag * 25 + 8;
  }

  if (config.showBarcodeText && barcode) {
    addText(barcode);
  }

  lines.push('^XZ');
  return lines.join('\n');
}

/**
 * @param {Array} labels
 * @param {Object} config
 * @returns {string} full ZPL job
 */
function buildZpl(labels, config) {
  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error('barcode-labels requires a non-empty data.labels array');
  }

  const parts = [];
  for (const label of labels) {
    const copies = Math.max(1, Number(label.copies) || 1);
    const zpl = buildOneLabel(label, config || {});
    for (let i = 0; i < copies; i++) {
      parts.push(zpl);
    }
  }
  return parts.join('\n');
}

module.exports = { buildZpl, buildOneLabel };
