import { Action, handleActions } from 'redux-actions';
import {INITIAL_STATE, ProgressState} from "./progress.state";
import {progressAction} from "./progress.action";

export const progressReducer = handleActions<ProgressState, any>({
  [progressAction.toString()]: (state: ProgressState, action: Action<string>) => {
    return { ...state, state: action.payload};
  },
}, INITIAL_STATE);
