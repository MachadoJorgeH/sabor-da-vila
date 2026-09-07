import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, setToken, clearToken, getToken } from "../api/client";
import { AuthContext } from "./AuthContextObject";
import type { AuthUser } from "./AuthContextObject";

interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<AuthUser | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      if (!getToken()) {
        setCarregando(false);
        return;
      }
      try {
        const user = await api.get<AuthUser>("/api/auth/me");
        setUsuario(user);
      } catch {
        clearToken();
      } finally {
        setCarregando(false);
      }
    }
    restaurarSessao();
  }, []);

  async function entrar(email: string, senha: string) {
    const result = await api.post<LoginResponse>("/api/auth/login", {
      email,
      password: senha,
    });
    setToken(result.token);
    setUsuario(result.user);
  }

  function sair() {
    clearToken();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}