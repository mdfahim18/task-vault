import { createContext } from "react";
import type { AuthState } from "./AuthReducer";

export interface AuthActionsValue {
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
}

export const AuthActionsContext = createContext<AuthActionsValue | null>(null);
export const AuthStateContext = createContext<AuthState | null>(null);
