// Selector
import { AppState } from './app.state';
import { RootState } from '../_root/root.state';
import { createSelector } from 'reselect';

export const getState = (state: RootState): AppState => {
  return state.app;
};

export const hasBootstrapped = createSelector(
  [getState], state => state.hasBootstrapped
);

export const getBootstrapError = createSelector(
  [getState], state => state.error
);