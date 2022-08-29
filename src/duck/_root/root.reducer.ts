import { combineReducers } from 'redux';
import { appReducer } from '../app/app.reducer';
import { RootState } from './root.state';
import { authReducer } from '../auth/auth.reducer';
import { entityReducer } from '../entity/entity.reducer';

export const rootReducer = combineReducers<RootState>({
  auth: authReducer,
  app: appReducer,
  entity: entityReducer
});