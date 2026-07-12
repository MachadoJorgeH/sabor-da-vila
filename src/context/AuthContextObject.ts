import { createContext } from "react";
import type { User } from "firebase/auth";

export interface AuthContextType {
  usuario: User | null;
  carregando: boolean;
}

export const AuthContext = createContext<AuthContextType>({ usuario: null, carregando: true });