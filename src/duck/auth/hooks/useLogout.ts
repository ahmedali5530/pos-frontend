import {useState} from 'react';
import {userLoggedOut} from '../auth.action';
import {useDispatch} from 'react-redux';
import Cookies from "js-cookie";

export interface LogoutState {
  isLoading: boolean;
  error?: any;
}

export type LogoutAction = () => Promise<void>;

export const useLogout = (): [LogoutState, LogoutAction] => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(undefined);

  const logout = async () => {
    setIsLoading(true);
    setError(undefined);

    //delete cookie
    Cookies.remove('JWT');
    Cookies.remove('refresh_token');

    dispatch(userLoggedOut());
  };

  return [{isLoading, error}, logout];
};
