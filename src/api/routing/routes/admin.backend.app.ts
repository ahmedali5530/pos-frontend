import { url } from '../url';

const scopeUrl = (path: string) => url('/' + path);
const adminScopeUrl = (route: string) => scopeUrl('admin/' + route);

export const LOGIN = scopeUrl('auth/login_check');
export const LOGOUT = scopeUrl('auth/logout');
export const AUTH_INFO = scopeUrl('auth/info');
export const FORGOT_PASSWORD = scopeUrl('auth/forgot-password');
export const UPDATE_LOCALE = scopeUrl('locale');

export const PROFILE = adminScopeUrl('profile/update');

export const GROUP_LIST = adminScopeUrl('group/list');
export const GROUP_CREATE = adminScopeUrl('group/create');
export const GROUP_GET = adminScopeUrl('group/:id');
export const GROUP_EDIT = adminScopeUrl('group/:id');
export const GROUP_DELETE = adminScopeUrl('group/:id');

export const NUMBER_LIST = adminScopeUrl('number/list');
export const NUMBER_CREATE = adminScopeUrl('number/create');
export const NUMBER_GET = adminScopeUrl('number/:id');
export const NUMBER_EDIT = adminScopeUrl('number/:id');
export const NUMBER_DELETE = adminScopeUrl('number/:id');

export const SENT_LIST = adminScopeUrl('sent/list');
export const SENT_CREATE = adminScopeUrl('sent/create');
export const SENT_GET = adminScopeUrl('sent/:id');
export const SENT_EDIT = adminScopeUrl('sent/:id');
export const SENT_DELETE = adminScopeUrl('sent/:id');

export const TEMPLATE_LIST = adminScopeUrl('template/list');
export const TEMPLATE_CREATE = adminScopeUrl('template/create');
export const TEMPLATE_GET = adminScopeUrl('template/:id');
export const TEMPLATE_EDIT = adminScopeUrl('template/:id');
export const TEMPLATE_DELETE = adminScopeUrl('template/:id');

export const USER_LIST = adminScopeUrl('user/list');
export const USER_CREATE = adminScopeUrl('user/create');
export const USER_GET = adminScopeUrl('user/:id');
export const USER_EDIT = adminScopeUrl('user/:id');
export const USER_DELETE = adminScopeUrl('user/:id');

export const MEDIA_UPLOAD = adminScopeUrl('media/upload');
export const MEDIA_DOWNLOAD = scopeUrl('media/d/:name');

export const SENDER_NAME_LIST = adminScopeUrl('sender-name/list');
export const SENDER_NAME_CREATE = adminScopeUrl('sender-name/create');
export const SENDER_NAME_GET = adminScopeUrl('sender-name/:id');
export const SENDER_NAME_EDIT = adminScopeUrl('sender-name/:id');
export const SENDER_NAME_DELETE = adminScopeUrl('sender-name/:id');

export const PACKAGE_LIST = adminScopeUrl('package/list');
export const PACKAGE_CREATE = adminScopeUrl('package/create');
export const PACKAGE_GET = adminScopeUrl('package/:id');
export const PACKAGE_EDIT = adminScopeUrl('package/:id');
export const PACKAGE_DELETE = adminScopeUrl('package/:id');
