/**
 * open routes
 */
const staticRoute = (route: string) => route;

export const LOGIN = staticRoute('/');
export const FORGOT_PASSWORD = staticRoute('/forgot-password');

/**
 * protected routes
 */
export const DASHBOARD = staticRoute('/dashboard');

export const USERS = staticRoute('/users');
export const USERS_CREATE = staticRoute('/users/create');
export const USERS_EDIT = staticRoute('/users/edit/:id');

export const PROFILE = staticRoute('/profile');
