import { Action, handleActions } from 'redux-actions';
import { bootstrapDone, bootstrapError } from './app.action';
import { AppState, INITIAL_STATE } from './app.state';

export const appReducer = handleActions<AppState, any>({

  [bootstrapDone.toString()]: (state: AppState) => {
    return { ...state, hasBootstrapped: true };
  },

  [bootstrapError.toString()]: (state: AppState, action: Action<Error>) => {
    return { ...state, error: action.payload };
  }

}, INITIAL_STATE);