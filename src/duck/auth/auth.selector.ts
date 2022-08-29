import { createSelector } from 'reselect';
import { getUserAccount } from '../entity/selector/user.account';
import {WithAuthState, WithEntityState} from "../_root/root.state";
import {AuthState} from "./auth.state";
import {createAuthorizedUserFromApiUserAccount} from "./model/authorized.user";

export const getState = (state: WithAuthState): AuthState => {
    return state.auth;
};

export const isUserLoggedIn = createSelector(
    [getState], state => state.isLoggedIn
);

export const getAuthorizedUser = createSelector(
    [getState, (rootState: WithEntityState) => rootState],
    (state, rootState) => {
        const userAccount = getUserAccount(rootState, state.userAccount!);

        if (!userAccount) {
            return null;
        }

        return createAuthorizedUserFromApiUserAccount(userAccount);
    }
);