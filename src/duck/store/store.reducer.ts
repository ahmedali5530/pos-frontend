import { Action, handleActions } from 'redux-actions';
import {INITIAL_STATE, StoreState} from "./store.state";
import {storeAction} from "./store.action";

export const storeReducer = handleActions<StoreState, any>({
  [storeAction.toString()]: (state: StoreState, action: Action<string>) => {
    return { ...state};
  },
}, INITIAL_STATE);
