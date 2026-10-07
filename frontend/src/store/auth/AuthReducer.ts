import { User } from "@/types";
import { AuthActions } from "./AuthActions";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction = { type: typeof AuthActions.set_loading; payload: boolean };

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
    default:
      return state;
  }
};
