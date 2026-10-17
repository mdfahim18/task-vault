import { User } from "@/types";
import { AuthActions } from "./AuthActions";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: typeof AuthActions.set_loading; payload: boolean }
  | {
      type: typeof AuthActions.login_success;
      payload: { user: User };
    }
  | { type: typeof AuthActions.set_error; payload: string };

export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case AuthActions.set_loading:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AuthActions.login_success:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        error: null,
      };
    case AuthActions.set_error:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};
