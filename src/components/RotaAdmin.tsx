import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function RotaAdmin({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();

  if (usuario?.role !== "admin") {
    return <Navigate to="/pedidos" replace />;
  }

  return <>{children}</>;
}
