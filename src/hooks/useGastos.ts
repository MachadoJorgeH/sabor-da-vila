import { useCallback, useEffect, useState } from "react";
import {
  listarGastos,
  adicionarGasto,
  atualizarGasto,
  removerGasto,
} from "../services/gastosService";
import type { Gasto } from "../types/gasto";

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setGastos(await listarGastos());
    } catch (erro) {
      console.error("Falha ao carregar os gastos:", erro);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionar(gasto: Omit<Gasto, "id" | "criadoEm">) {
    setSalvando(true);
    try {
      await adicionarGasto(gasto);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function atualizar(id: string, gasto: Omit<Gasto, "id" | "criadoEm">) {
    setSalvando(true);
    try {
      await atualizarGasto(id, gasto);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(gasto: Gasto) {
    if (!gasto.id) return;
    setSalvando(true);
    try {
      await removerGasto(gasto);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  return { gastos, salvando, adicionar, atualizar, remover };
}
