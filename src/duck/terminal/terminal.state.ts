import {Terminal} from "../../api/model/terminal";

export interface TerminalState {
  terminal?: Terminal;
}

export const INITIAL_STATE: TerminalState = {
  terminal: undefined
};
