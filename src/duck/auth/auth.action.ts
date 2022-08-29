import { createAction } from 'redux-actions';
import {User} from '../../api/model/user';
import { EntityMeta } from '../entity/entity.action';
import { UserAccountSchema } from '../entity/entity.schema';

export const authenticateUser = createAction('AUTHENTICATE_USER');
export const userAuthenticated = createAction<User, EntityMeta>(
  'USER_AUTHENTICATED',
  payload => payload,
  () => ({ schema: UserAccountSchema })
);
export const userAuthenticationFailed = createAction('AUTHENTICATE_USER_ERROR');

export const logout = createAction('LOGOUT');
export const userLoggedOut = createAction('USER_SESSION_END');
export const logoutError = createAction('LOGOUT_ERROR');