import { Action, handleActions } from 'redux-actions';
import { userAuthenticated, userLoggedOut } from './auth.action';
import { AuthState, INITIAL_STATE } from './auth.state';

export const authReducer = handleActions<AuthState, any>({

  [userAuthenticated.toString()]: (state: AuthState, action: Action<string>) => {
    return { ...state, isLoggedIn: true, userAccount: action.payload };
  },

  [userLoggedOut.toString()]: (state: AuthState) => {
    return { ...state, isLoggedIn: false, userAccount: undefined };
  }

}, INITIAL_STATE);