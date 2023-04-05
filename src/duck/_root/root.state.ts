import { AppState } from '../app/app.state';
import {AuthState} from "../auth/auth.state";
import {EntityState} from "../entity/entity.state";
import {StoreState} from "../store/store.state";
import {DisplayShortcutState, ShortcutState} from "../shortcuts/shortcut.state";
import {TouchState} from "../touch/touch.state";
import {TerminalState} from "../terminal/terminal.state";

export interface WithAuthState {
  auth: AuthState;
}

export interface WithEntityState {
  entity: EntityState
}

export interface RootState extends WithAuthState, WithEntityState {
  app: AppState,
  store: StoreState,
  shortcut: ShortcutState,
  displayShortcut: DisplayShortcutState,
  touch: TouchState,
  terminal: TerminalState
}
