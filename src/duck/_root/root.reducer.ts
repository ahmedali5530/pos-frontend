import { combineReducers } from 'redux';
import { appReducer } from '../app/app.reducer';
import { RootState } from './root.state';
import { authReducer } from '../auth/auth.reducer';
import { entityReducer } from '../entity/entity.reducer';
import {storeReducer} from "../store/store.reducer";
import {displayShortcutReducer, shortcutReducer} from "../shortcuts/shortcut.reducer";
import {touchReducer} from "../touch/touch.reducer";
import {terminalReducer} from "../terminal/terminal.reducer";
import {progressReducer} from "../progress/progress.reducer";

export const rootReducer = combineReducers<RootState>({
  auth: authReducer,
  app: appReducer,
  entity: entityReducer,
  store: storeReducer,
  shortcut: shortcutReducer,
  displayShortcut: displayShortcutReducer,
  touch: touchReducer,
  terminal: terminalReducer,
  progress: progressReducer
});
