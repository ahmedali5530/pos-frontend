import { call, put } from 'redux-saga/effects';
import { logoutError, userAuthenticated, userAuthenticationFailed, userLoggedOut } from './auth.action';
import { AuthInfoResponse, getAuthInfo, UserNotAuthorizedException } from '../../api/api/account/info';
import { User } from "../../api/model/user";
import {jsonRequest} from "../../api/request/request";
import {LOGOUT} from "../../api/routing/routes/backend.app";
import {storeAction} from "../store/store.action";
import Cookies from "js-cookie";
import {terminalAction} from "../terminal/terminal.action";

export async function authLogout(): Promise<void> {
  await jsonRequest(LOGOUT, { method: 'post' });
  return;
}

export function* authenticateUser() {
  let response: AuthInfoResponse;

  try {
    response = yield call(getAuthInfo);
  } catch (exception) {
    if (exception instanceof UserNotAuthorizedException) {
      yield put(userAuthenticationFailed(exception));
      return;
    }

    throw exception;
  }

  yield put(
    userAuthenticated(response.user as User)
  );

  yield put(
    storeAction(JSON.parse(Cookies.get('store') as string))
  );

  yield put(
    terminalAction(JSON.parse(Cookies.get('terminal') as string))
  );
}

export function* logout() {
  try {
    yield call(authLogout);
  } catch (exception) {
    yield put(logoutError(exception));
    return;
  }

  yield put(userLoggedOut());
}
