import { createContext } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  usuario: AuthUser | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  carregando: true,
  entrar: async () => {},
  sair: () => {},
});