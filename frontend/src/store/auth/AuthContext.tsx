import { ReactNode, useCallback, useMemo, useReducer } from "react";
import { authReducer, AuthState } from "./AuthReducer";
import { AuthActions } from "./AuthActions";
import {
  AuthActionsContext,
  AuthActionsValue,
  AuthStateContext,
} from "./AuthContentValue";
import { authService } from "@/services/authService";

const initial_state: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initial_state);

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      dispatch({ type: AuthActions.set_loading, payload: true });

      try {
        const { user } = await authService.register(data);
        dispatch({ type: AuthActions.login_success, payload: { user } });
        return true;
      } finally {
        dispatch({ type: AuthActions.set_loading, payload: false });
      }
    },
    []
  );

  const actionsValue = useMemo<AuthActionsValue>(
    () => ({ register }),
    [register]
  );

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};
