import { Action, handleActions } from 'redux-actions';
import {ShortcutState, INITIAL_STATE, DisplayShortcutState, DISPLAY_INITIAL_STATE} from "./shortcut.state";
import {displayShortcutAction, shortcutAction} from "./shortcut.action";

export const shortcutReducer = handleActions<ShortcutState, any>({
  [shortcutAction.toString()]: (state: ShortcutState, action: Action<boolean>) => {
    return { ...state, shortcut: action.payload };
  },
}, INITIAL_STATE);

export const displayShortcutReducer = handleActions<DisplayShortcutState, any>({
  [displayShortcutAction.toString()]: (state: DisplayShortcutState, action: Action<boolean>) => {
    return { ...state, display: action.payload};
  }
}, DISPLAY_INITIAL_STATE);
