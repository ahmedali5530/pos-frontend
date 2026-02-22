import {url} from '../url';

const scopeUrl = (path: string) => url('/' + path);
const adminScopeUrl = (route: string) => scopeUrl('admin/' + route);

export const LOGIN = scopeUrl('auth/login_check');

export const PROFILE = adminScopeUrl('profile/update');


