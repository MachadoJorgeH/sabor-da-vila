import { api } from "../api/client";
import type { Usuario, RoleUsuario } from "../types/usuario";

interface UserApi {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

function paraUsuario(u: UserApi): Usuario {
  return {
    id: u.id,
    email: u.email,
    nome: u.name,
    role: u.role as RoleUsuario,
    criadoEm: u.createdAt,
  };
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const dados = await api.get<UserApi[]>("/api/users");
  return dados.map(paraUsuario);
}

export async function criarUsuario(dados: {
  email: string;
  senha: string;
  nome: string;
  role: RoleUsuario;
}) {
  await api.post("/api/users", {
    email: dados.email,
    password: dados.senha,
    name: dados.nome,
    role: dados.role,
  });
}

export async function atualizarUsuario(
  id: string,
  dados: { nome: string; role: RoleUsuario; senha?: string },
) {
  await api.put(`/api/users/${id}`, {
    name: dados.nome,
    role: dados.role,
    password: dados.senha ?? null,
  });
}

export async function removerUsuario(id: string) {
  await api.delete(`/api/users/${id}`);
}
