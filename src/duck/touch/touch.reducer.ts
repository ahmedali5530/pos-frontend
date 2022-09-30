import { Action, handleActions } from 'redux-actions';
import {INITIAL_STATE, TouchState} from "./touch.state";
import {touchAction} from "./touch.action";

export const touchReducer = handleActions<TouchState, any>({
  [touchAction.toString()]: (state: TouchState, action: Action<boolean>) => {
    return { ...state, touch: action.payload};
  },
}, INITIAL_STATE);
