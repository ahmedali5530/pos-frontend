import { Action, handleActions } from 'redux-actions';
import {ShortcutState, INITIAL_STATE} from "./shortcut.state";
import {shortcutAction} from "./shortcut.action";

export const shortcutReducer = handleActions<ShortcutState, any>({
  [shortcutAction.toString()]: (state: ShortcutState, action: Action<boolean>) => {
    return { ...state, shortcut: action.payload };
  },
}, INITIAL_STATE);
