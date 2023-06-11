import {createAction} from 'redux-actions';

export const progressAction = createAction(
  'PROGRESS_ACTION',
  (payload: any) => payload
);
