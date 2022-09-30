import { createSelector } from 'reselect';
import {TouchState} from "./touch.state";
import {RootState} from "../_root/root.state";

export const getState = (state: RootState): TouchState => {
    return state.touch;
};

export const getTouch = createSelector(
    [getState], state => state.touch
);
