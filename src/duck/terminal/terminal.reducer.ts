import { Action, handleActions } from 'redux-actions';
import {INITIAL_STATE, TerminalState} from "./terminal.state";
import {terminalAction} from "./terminal.action";
import {Terminal} from "../../api/model/terminal";

export const terminalReducer = handleActions<TerminalState, any>({
  [terminalAction.toString()]: (state: TerminalState, action: Action<Terminal>) => {
    return { ...state, terminal: action.payload};
  },
}, INITIAL_STATE);
