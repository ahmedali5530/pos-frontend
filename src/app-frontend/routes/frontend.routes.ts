/**
 * open routes
 */
const staticRoute = (route: string) => route;

export const LOGIN = staticRoute('/');
export const FORGOT_PASSWORD = staticRoute('/forgot-password');
export const RESET_PASSWORD = staticRoute('/reset-password/*');

export const POS = staticRoute('/pos');
export const POS_V2 = staticRoute('/pos/v2');
