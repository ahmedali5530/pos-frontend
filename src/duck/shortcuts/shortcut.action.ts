import { createAction } from 'redux-actions';

export const shortcutAction = createAction(
  'SHORTCUT_ACTION',
  (payload: any) => payload
);

export const displayShortcutAction = createAction(
  'DISPLAY_SHORTCUT_ACTION',
  (payload: any) => payload
)
