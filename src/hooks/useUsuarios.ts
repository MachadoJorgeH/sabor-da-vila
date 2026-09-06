import { useCallback, useEffect, useState } from "react";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  removerUsuario,
} from "../services/usuariosService";
import type { Usuario, RoleUsuario } from "../types/usuario";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setUsuarios(await listarUsuarios());
    } catch (erro) {
      console.error("Falha ao carregar os usuários:", erro);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionar(dados: {
    email: string;
    senha: string;
    nome: string;
    role: RoleUsuario;
  }) {
    setSalvando(true);
    try {
      await criarUsuario(dados);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function atualizar(
    id: string,
    dados: { nome: string; role: RoleUsuario; senha?: string },
  ) {
    setSalvando(true);
    try {
      await atualizarUsuario(id, dados);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    setSalvando(true);
    try {
      await removerUsuario(id);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  return { usuarios, salvando, adicionar, atualizar, remover };
}
