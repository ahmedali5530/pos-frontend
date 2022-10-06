import { Action, handleActions } from 'redux-actions';
import {INITIAL_STATE, StoreState} from "./store.state";
import {storeAction} from "./store.action";
import {Store} from "../../api/model/store";

export const storeReducer = handleActions<StoreState, any>({
  [storeAction.toString()]: (state: StoreState, action: Action<Store>) => {
    return { ...state, store: action.payload};
  },
}, INITIAL_STATE);
