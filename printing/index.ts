/**
 * Print server runs separately: `cd printing && npm start`
 * POST http://localhost:3132/print
 *
 * Body: {
 *   data: {
 *     printType: 'temp'|'refund'|'final'|'delivery'|'kitchen'|'summary',
 *     order?: Order (OrderModel from @/api/model/order)
 *   },
 *   config?: {
 *     currencySymbol?: string (default: "$"),
 *     bottomMargin?, topMargin?, leftMargin?, rightMargin?,
 *     companyName?, logo?, showCompanyName?, showItemName?,
 *     showItemPrice?, showItemQuantity?, showItemTotal?,
 *     showVatNumber?, vatName?, vatNumber?
 *   },
 *   printers: [
 *     {
 *       prints: number|string (number of copies, default: 1),
 *       printers: [PrinterModel] (from @/api/model/printer)
 *     }
 *   ]
 * }
 */

export const PRINT_SERVER_URL = 'http://localhost:3132';
