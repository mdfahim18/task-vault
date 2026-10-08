import { ReactNode, useCallback, useReducer } from "react";
import { authReducer, AuthState } from "./AuthReducer";
import { AuthActions } from "./AuthActions";
import { AuthActionsContext } from "./AuthContentValue";

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
        return false;
      } finally {
        dispatch({ type: AuthActions.set_loading, payload: false });
      }
    },
    []
  );

  const actionsValue = { register };

  return (
    <AuthActionsContext.Provider value={actionsValue}>
      {children}
    </AuthActionsContext.Provider>
  );
};
