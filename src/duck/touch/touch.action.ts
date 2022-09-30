import {createAction} from 'redux-actions';

export const touchAction = createAction(
  'TOUCH_ACTION',
  (payload: any) => payload
);
