import {useState} from 'react';
import Cookies from "js-cookie";
import {useAtom} from "jotai";
import {appState} from "../../../store/jotai";

export interface LogoutState {
  isLoading: boolean;
  error?: any;
}

export type LogoutAction = () => Promise<void>;

export const useLogout = (): [LogoutState, LogoutAction] => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [, setAppState] = useAtom(appState);

  const logout = async () => {
    setIsLoading(true);
    setError(undefined);

    setAppState(prev => ({
      ...prev,
      loggedIn: false,
      user: undefined,
      terminal: undefined,
      store: undefined
    }));

    // await jsonRequest(AUTH_LOGOUT);
  };

  return [{isLoading, error}, logout];
};
