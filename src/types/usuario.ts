export type RoleUsuario = "admin" | "operator";

export const ROLES: RoleUsuario[] = ["admin", "operator"];

export const LABEL_ROLE: Record<RoleUsuario, string> = {
  admin: "Administrador",
  operator: "Operador",
};

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  role: RoleUsuario;
  criadoEm: string;
}
