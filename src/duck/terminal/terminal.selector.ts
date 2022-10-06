import { createSelector } from 'reselect';
import {TerminalState} from "./terminal.state";
import {RootState} from "../_root/root.state";

export const getState = (state: RootState): TerminalState => {
    return state.terminal;
};

export const getTerminal = createSelector(
    [getState], state => state.terminal
);
