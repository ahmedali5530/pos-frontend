'use strict';

const net = require('net');

/**
 * Write a raw buffer to a network printer over TCP (e.g. ZPL on port 9100).
 * @param {string} ip
 * @param {number} [port=9100]
 * @param {Buffer|string} data
 * @param {number} [timeoutMs=15000]
 * @returns {Promise<void>}
 */
function writeRaw(ip, port = 9100, data, timeoutMs = 15000) {
  if (!ip) {
    return Promise.reject(new Error('Network printer requires "ip"'));
  }

  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch (_) { /* ignore */ }
      if (err) reject(err);
      else resolve();
    };

    socket.setTimeout(timeoutMs);

    socket.once('timeout', () => finish(new Error(`Printer ${ip}:${port} timed out`)));
    socket.once('error', (err) => finish(err));

    socket.connect(Number(port) || 9100, ip, () => {
      socket.write(buffer, (writeErr) => {
        if (writeErr) {
          return finish(writeErr);
        }
        socket.end(() => finish());
      });
    });
  });
}

module.exports = { writeRaw };
