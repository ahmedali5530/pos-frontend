import {createAction} from 'redux-actions';

export const terminalAction = createAction(
  'TERMINAL_ACTION',
  (payload: any) => payload
);
