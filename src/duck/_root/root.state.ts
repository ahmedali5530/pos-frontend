import { AppState } from '../app/app.state';
import {AuthState} from "../auth/auth.state";
import {EntityState} from "../entity/entity.state";

export interface WithAuthState {
  auth: AuthState;
}

export interface WithEntityState {
  entity: EntityState
}

export interface RootState extends WithAuthState, WithEntityState {
  app: AppState,
}