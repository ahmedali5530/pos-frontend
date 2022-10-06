import { url } from '../url';

const scopeUrl = (path: string) => url(path);

export const LOGIN = scopeUrl('/auth/login_check');
export const LOGOUT = scopeUrl('/auth/logout');
export const AUTH_INFO = scopeUrl('/auth/info');
export const FORGOT_PASSWORD = scopeUrl('/auth/forgot-password');
export const RESET_PASSWORD = scopeUrl('/auth/reset-password');
export const UPDATE_LOCALE = scopeUrl('/locale');

export const AUTH_LOGOUT = scopeUrl('/auth/logout');

export const PRODUCT_LIST = scopeUrl('/admin/product/list');
export const PRODUCT_KEYWORDS = scopeUrl('/admin/product/keywords');
export const PRODUCT_CREATE = scopeUrl('/admin/product/create');
export const PRODUCT_GET = scopeUrl('/admin/product/:id');
export const PRODUCT_UPLOAD = scopeUrl('/admin/product/import');
export const PRODUCT_DOWNLOAD = scopeUrl('/admin/product/export');

export const ORDER_LIST = scopeUrl('/admin/order/list');
export const ORDER_CREATE = scopeUrl('/admin/order/create');
export const ORDER_GET = scopeUrl('/admin/order/:id');
export const ORDER_DISPATCH = scopeUrl('/admin/order/dispatch/:id');
export const ORDER_RESTORE = scopeUrl('/admin/order/restore/:id');
export const ORDER_REFUND = scopeUrl('/admin/order/refund/:id');

export const DISCOUNT_LIST = scopeUrl('/admin/discount/list');
export const DISCOUNT_CREATE = scopeUrl('/admin/discount/create');
export const DISCOUNT_GET = scopeUrl('/admin/discount/:id');

export const TAX_LIST = scopeUrl('/admin/tax/list');
export const TAX_CREATE = scopeUrl('/admin/tax/create');
export const TAX_GET = scopeUrl('/admin/tax/:id');

export const PAYMENT_TYPE_LIST = scopeUrl('/admin/payment-types/list');
export const PAYMENT_TYPE_CREATE = scopeUrl('/admin/payment-types/create');
export const PAYMENT_TYPE_GET = scopeUrl('/admin/payment-types/:id');

export const CUSTOMER_LIST = scopeUrl('/admin/customer/list');
export const CUSTOMER_CREATE = scopeUrl('/admin/customer/create');
export const CUSTOMER_PAYMENT_CREATE = scopeUrl('/admin/customer/payment/:id');

export const CATEGORY_LIST = scopeUrl('/admin/category/list');
export const CATEGORY_CREATE = scopeUrl('/admin/category/create');
export const CATEGORY_GET = scopeUrl('/admin/category/:id');

export const DEVICE_LIST = scopeUrl('/admin/device/list');
export const DEVICE_CREATE = scopeUrl('/admin/device/create');

export const EXPENSE_LIST = scopeUrl('/admin/expense/list');
export const EXPENSE_CREATE = scopeUrl('/admin/expense/create');

export const SUPPLIER_LIST = scopeUrl('/admin/supplier/list');
export const SUPPLIER_CREATE = scopeUrl('/admin/supplier/create');
export const SUPPLIER_EDIT = scopeUrl('/admin/supplier/:id');

export const BRAND_LIST = scopeUrl('/admin/brand/list');
export const BRAND_CREATE = scopeUrl('/admin/brand/create');
export const BRAND_EDIT = scopeUrl('/admin/brand/:id');

export const PURCHASE_LIST = scopeUrl('/admin/purchase/list');
export const PURCHASE_CREATE = scopeUrl('/admin/purchase/create');
export const PURCHASE_EDIT = scopeUrl('/admin/purchase/:id');
export const PURCHASE_DELETE = scopeUrl('/admin/purchase/:id');

export const STORE_LIST = scopeUrl('/admin/store/list');
export const STORE_CREATE = scopeUrl('/admin/store/create');
export const STORE_EDIT = scopeUrl('/admin/store/:id');

export const USER_LIST = scopeUrl('/admin/user/list');
export const USER_CREATE = scopeUrl('/admin/user/create');
export const USER_EDIT = scopeUrl('/admin/user/:id');

export const CLOSING_EDIT = scopeUrl('/admin/closing/:id');
export const CLOSING_OPENED = scopeUrl('/admin/closing/opened');

export const DEPARTMENT_LIST = scopeUrl('/admin/department/list');
export const DEPARTMENT_CREATE = scopeUrl('/admin/department/create');
export const DEPARTMENT_GET = scopeUrl('/admin/department/:id');

export const SETTING_LIST = scopeUrl('/admin/setting/list');
export const SETTING_GET = scopeUrl('/admin/setting/:id');
export const SETTING_CREATE = scopeUrl('/admin/setting/create');

export const TERMINAL_LIST = scopeUrl('/admin/terminal/list');
export const TERMINAL_CREATE = scopeUrl('/admin/terminal/create');
export const TERMINAL_GET = scopeUrl('/admin/terminal/:id');
