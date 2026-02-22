'use strict';

const escpos = require('escpos');
const { createDevice } = require('./drivers');
const { getBuilder } = require('./print-builders');

const DEFAULT_OPTIONS = { encoding: 'UTF-8', width: 48 };

/**
 * Open device, create Printer, run build, then close.
 * @param {Object} device - escpos adapter
 * @param {Object} escposOptions - { encoding, width }
 * @param {string} printType - temp | summary | kitchen | delivery | final | refund
 * @param {Object} data - payload for the print builder
 * @param {Object} config - normalized printer config (margins, logo, companyName, show*, vat*)
 * @returns {Promise<void>}
 */
function printOnDevice(device, escposOptions, printType, data, config) {
  const printer = new escpos.Printer(device, { ...DEFAULT_OPTIONS, ...escposOptions });

  return new Promise((resolve, reject) => {
    device.open((openErr) => {
      if (openErr) {
        return reject(openErr);
      }

      const builder = getBuilder(printType);

      Promise.resolve(builder.build(printer, data, config))
        .then(() => {
          return new Promise((res, rej) => {
            printer.close((closeErr) => (closeErr ? rej(closeErr) : res()));
          });
        })
        .then(resolve)
        .catch(reject);
    });
  });
}

/**
 * Convert PrinterModel or driver config to driver config.
 * Handles both formats:
 * 1. PrinterModel: { id, name, ip_address, port, type, ... }
 * 2. Driver config (already converted): { type, ip, port, ... }
 * @param {Object} printerModelOrConfig - PrinterModel or driver config object
 * @returns {Object} driver config ready for createDevice
 */
function printerModelToDriverConfig(printerModelOrConfig) {
  if (!printerModelOrConfig || typeof printerModelOrConfig !== 'object') {
    throw new Error('Invalid printer model: must be an object');
  }

  // Check if this is already a driver config (has 'ip' or 'path' or 'address' or 'vid')
  // Driver configs from frontend have: { type, ip, port } or { type, path, baudRate }, etc.
  const hasDriverConfigFields = 'ip' in printerModelOrConfig || 
                                 'path' in printerModelOrConfig || 
                                 'address' in printerModelOrConfig || 
                                 'vid' in printerModelOrConfig;
  
  let type;
  let config;
  
  if (hasDriverConfigFields) {
    // Already a driver config format
    type = printerModelOrConfig.type;
    config = { ...printerModelOrConfig };
  } else {
    // It's a PrinterModel - extract type from various possible locations
    type = printerModelOrConfig.type;
    
    // Handle different type formats
    if (type === undefined || type === null) {
      // Try nested object structure (SurrealDB or form select)
      if (printerModelOrConfig.type && typeof printerModelOrConfig.type === 'object') {
        type = printerModelOrConfig.type.value || printerModelOrConfig.type.label || printerModelOrConfig.type;
      }
    }
    
    // If still no type, try to infer from available fields
    if (!type || type === undefined || type === null) {
      // Check what fields are available to infer type
      if (printerModelOrConfig.ip_address || printerModelOrConfig.ipAddress || printerModelOrConfig.ip) {
        type = 'network'; // Most common, default to network
      } else if (printerModelOrConfig.vid || printerModelOrConfig.pid) {
        type = 'usb';
      } else if (printerModelOrConfig.address) {
        type = 'bluetooth';
      } else {
        type = 'network'; // Default fallback
      }
    }
    
    config = { type };
    
    // Extract ip_address (handle different field names)
    const ipAddress = printerModelOrConfig.ip_address || printerModelOrConfig.ipAddress || printerModelOrConfig.ip;
    const port = printerModelOrConfig.port != null ? Number(printerModelOrConfig.port) : null;
    
    // Build config based on type
    if (type === 'network') {
      if (!ipAddress) {
        throw new Error('Network printer requires ip_address field. Printer: ' + JSON.stringify({
          id: printerModelOrConfig.id,
          name: printerModelOrConfig.name,
          keys: Object.keys(printerModelOrConfig)
        }));
      }
      config.ip = ipAddress;
      config.port = port || 9100;
    } else if (type === 'serial') {
      config.path = printerModelOrConfig.path || ipAddress || '/dev/ttyUSB0';
      config.baudRate = printerModelOrConfig.baudRate || port || 9600;
    } else if (type === 'usb') {
      if (printerModelOrConfig.vid) config.vid = printerModelOrConfig.vid;
      if (printerModelOrConfig.pid) config.pid = printerModelOrConfig.pid;
    } else if (type === 'bluetooth') {
      config.address = printerModelOrConfig.address || ipAddress;
      config.channel = printerModelOrConfig.channel || port || 1;
    }
    
    if (printerModelOrConfig.escposOptions) {
      config.escposOptions = printerModelOrConfig.escposOptions;
    }
  }
  
  // Normalize type to lowercase string
  type = String(type || 'network').toLowerCase().trim();
  config.type = type;
  
  // Validate type
  const validTypes = ['usb', 'serial', 'network', 'bluetooth'];
  if (!validTypes.includes(type)) {
    throw new Error(`Unknown printer type: "${type}". Valid types: ${validTypes.join(', ')}. Printer data: ${JSON.stringify({
      id: printerModelOrConfig.id,
      name: printerModelOrConfig.name,
      type: printerModelOrConfig.type,
      typeValue: type,
      keys: Object.keys(printerModelOrConfig)
    })}`);
  }
  
  return config;
}

/**
 * Handle print request: for each printer group, print to each printer the specified number of times.
 * @param {Object} body - { 
 *   printers: Array<{ prints: number|string, printers: Array<PrinterModel> }>, 
 *   data: { printType, order, ... }, 
 *   config?: { companyName, logo, margins, show*, vat*, currencySymbol } 
 * }
 * @returns {Promise<{ success: boolean, results: Array<{ index: number, ok: boolean, error?: string }> }>}
 */
async function handlePrint(body) {
  const { printers = [], data = {}, config: rawConfig = {} } = body;
  const printType = data.printType || 'final';

  if (!Array.isArray(printers) || printers.length === 0) {
    throw new Error('Request must include a non-empty "printers" array');
  }

  const { normalizeConfig } = require('./lib/receipt-helpers');
  const config = normalizeConfig(rawConfig);

  const results = [];
  let resultIndex = 0;

  // Handle new structure: printers = [{ prints: "1", printers: [PrinterModel] }]
  for (let groupIndex = 0; groupIndex < printers.length; groupIndex++) {
    const group = printers[groupIndex];
    const printsCount = Math.max(1, parseInt(group.prints, 10) || 1);
    const printerModels = Array.isArray(group.printers) ? group.printers : [];

    if (printerModels.length === 0) {
      // Fallback: if group is a direct printer config (old format)
      try {
        const device = createDevice(group);
        await printOnDevice(device, group.escposOptions || {}, printType, data, config);
        results.push({ index: resultIndex++, ok: true });
      } catch (err) {
        results.push({
          index: resultIndex++,
          ok: false,
          error: err && (err.message || String(err)),
        });
      }
      continue;
    }

    // For each printer in the group, print the specified number of times
    for (const printerModel of printerModels) {
      for (let printNum = 0; printNum < printsCount; printNum++) {
        try {
          // Log printer model for debugging
          if (!printerModel || typeof printerModel !== 'object') {
            throw new Error(`Invalid printer model: expected object, got ${typeof printerModel}`);
          }
          
          // Debug: log the actual printer data structure (can be removed in production)
          if (process.env.NODE_ENV !== 'production') {
            console.log('Processing printer:', JSON.stringify(printerModel, null, 2));
          }
          
          const driverConfig = printerModelToDriverConfig(printerModel);
          const device = createDevice(driverConfig);
          await printOnDevice(device, driverConfig.escposOptions || {}, printType, data, config);
          results.push({ index: resultIndex++, ok: true });
        } catch (err) {
          const errorMsg = err && (err.message || String(err));
          // Include full printer info in error for debugging
          const printerInfo = printerModel ? JSON.stringify({
            id: printerModel.id,
            name: printerModel.name,
            type: printerModel.type,
            ip_address: printerModel.ip_address,
            port: printerModel.port,
            hasType: 'type' in printerModel,
            hasIp: 'ip' in printerModel,
            hasIpAddress: 'ip_address' in printerModel,
            allKeys: Object.keys(printerModel)
          }, null, 2) : 'null';
          results.push({
            index: resultIndex++,
            ok: false,
            error: `${errorMsg}\nPrinter data: ${printerInfo}`,
          });
        }
      }
    }
  }

  const success = results.every((r) => r.ok);
  return { success, results };
}

module.exports = { handlePrint, printOnDevice, getBuilder, createDevice };
