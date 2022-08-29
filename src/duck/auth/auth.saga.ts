import { call, put } from 'redux-saga/effects';
import { logoutError, userAuthenticated, userAuthenticationFailed, userLoggedOut } from './auth.action';
import { AuthInfoResponse, getAuthInfo, UserNotAuthorizedException } from '../../api/api/account/info';
import { User } from "../../api/model/user";
import {jsonRequest} from "../../api/request/request";
import {LOGOUT} from "../../api/routing/routes/backend.app";

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