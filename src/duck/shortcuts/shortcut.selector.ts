import { createSelector } from 'reselect';
import {RootState} from "../_root/root.state";
import {ShortcutState} from "./shortcut.state";

export const getState = (state: RootState): ShortcutState => {
    return state.shortcut;
};

export const getShortcut = createSelector(
    [getState], state => state.shortcut
);

export const getDisplayState = (state: RootState) => {
    return state.displayShortcut;
}

export const displayShortcut = createSelector(
  [getDisplayState], state => state.display
)
