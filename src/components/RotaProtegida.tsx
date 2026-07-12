import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-alt text-text-muted">
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}