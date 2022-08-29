export interface AuthState {
  isLoggedIn: boolean;
  userAccount?: string;
}

export const INITIAL_STATE: AuthState = {
  isLoggedIn: false
};