import { createSelector } from 'reselect';
import {ProgressState} from "./progress.state";
import {RootState} from "../_root/root.state";

export const getState = (state: RootState): ProgressState => {
    return state.progress;
};

export const getProgress = createSelector(
    [getState], state => state.state
);
