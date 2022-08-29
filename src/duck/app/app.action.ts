import { createAction } from 'redux-actions';

export const bootstrap = createAction('BOOTSTRAP');
export const bootstrapDone = createAction('BOOTSTRAP_DONE');
export const bootstrapError = createAction('BOOTSTRAP_ERROR');
