/**
 * open routes
 */
const staticRoute = (route: string) => route;

export const LOGIN = staticRoute('/');
export const FORGOT_PASSWORD = staticRoute('/forgot-password');
export const RESET_PASSWORD = staticRoute('/reset-password/*');

export const POS = staticRoute('/pos');
export const SETTINGS = staticRoute('/settings');
export const POS_V2 = staticRoute('/pos/v2');
export const DASHBOARD = staticRoute('/pos/dashboard');

export const REPORTS = '/reports';
export const REPORTS_PRODUCT_MIX_WEEKLY = REPORTS + '/product-mix-weekly';
export const REPORTS_AUDIT = REPORTS + '/audit';
export const REPORTS_CASH_CLOSING = REPORTS + '/cash-closing';
export const REPORTS_DISCOUNTS = REPORTS + '/discounts';
export const REPORTS_PRODUCT_HOURLY = REPORTS + '/product-hourly';
export const REPORTS_PRODUCT_LIST = REPORTS + '/product-list';
export const REPORTS_PRODUCT_MIX_SUMMARY = REPORTS + '/product-mix-summary';
export const REPORTS_PRODUCT_SUMMARY = REPORTS + '/product-summary';
export const REPORTS_SALES_ADVANCED = REPORTS + '/sales-advanced';
export const REPORTS_SALES_HOURLY_LABOUR = REPORTS + '/sales-hourly-labour';
export const REPORTS_SALES_HOURLY_LABOUR_WEEKLY = REPORTS + '/sales-hourly-labour-weekly';
export const REPORTS_SALES_SERVER = REPORTS + '/sales-server';
export const REPORTS_SALES_SUMMARY = REPORTS + '/sales-summary';
export const REPORTS_SALES_SUMMARY2 = REPORTS + '/sales-summary-2';
export const REPORTS_SALES_WEEKLY = REPORTS + '/sales-weekly';
export const REPORTS_TIPS = REPORTS + '/tips';
export const REPORTS_TABLES_SUMMARY = REPORTS + '/tables-summary';
export const REPORTS_VOIDS = REPORTS + '/voids';
export const REPORTS_CURRENT_INVENTORY = REPORTS + '/current-inventory';
export const REPORTS_DETAILED_INVENTORY = REPORTS + '/detailed-inventory';
export const REPORTS_PURCHASE = REPORTS + '/purchase';
export const REPORTS_PURCHASE_RETURN = REPORTS + '/purchase-return';
export const REPORTS_WASTE = REPORTS + '/waste';
export const REPORTS_CONSUMPTION = REPORTS + '/consumption';
export const REPORTS_SALE_VS_CONSUMPTION = REPORTS + '/sale-vs-consumption';