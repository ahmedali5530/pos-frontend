import { createAction } from 'redux-actions';

export const shortcutAction = createAction(
  'SHORTCUT_ACTION',
  (payload: any) => payload
);
