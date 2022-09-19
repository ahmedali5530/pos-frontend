import { AppState } from '../app/app.state';
import {AuthState} from "../auth/auth.state";
import {EntityState} from "../entity/entity.state";
import {StoreState} from "../store/store.state";
import {ShortcutState} from "../shortcuts/shortcut.state";

export interface WithAuthState {
  auth: AuthState;
}

export interface WithEntityState {
  entity: EntityState
}

export interface RootState extends WithAuthState, WithEntityState {
  app: AppState,
  store: StoreState,
  shortcut: ShortcutState
}
