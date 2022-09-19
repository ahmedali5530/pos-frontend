import { createSelector } from 'reselect';
import {StoreState} from "./store.state";
import {RootState} from "../_root/root.state";

export const getState = (state: RootState): StoreState => {
    return state.store;
};

export const getStore = createSelector(
    [getState], state => state.store
);
