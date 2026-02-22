import { url } from '../url';

export const scopeUrl = (path: string) => url(path);

export const AUTH_INFO = scopeUrl('/auth/info');
export const FORGOT_PASSWORD = scopeUrl('/auth/forgot-password');
export const RESET_PASSWORD = scopeUrl('/auth/reset-password');