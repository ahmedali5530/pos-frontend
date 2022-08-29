import { call, put, takeEvery } from 'redux-saga/effects';
import { bootstrap as bootstrapAction, bootstrapDone, bootstrapError } from './app.action';
import { authenticateUser } from '../auth/auth.saga';


export function* bootstrap() {
  try {
    yield call(authenticateUser);
  } catch (exception) {
    yield put(bootstrapError(exception));
    return;
  }

  yield put(bootstrapDone({ hasBootstrapped: true }));
}

export function* appSaga() {
  yield takeEvery(bootstrapAction.toString(), bootstrap);
}