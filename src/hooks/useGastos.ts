import { useEffect, useState } from "react";
import {
  ouvirGastos,
  adicionarGasto,
  atualizarGasto,
  removerGasto,
} from "../services/gastosService";
import type { Gasto } from "../types/gasto";

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const unsubscribe = ouvirGastos(setGastos);
    return () => unsubscribe();
  }, []);

  async function adicionar(gasto: Omit<Gasto, "id" | "criadoEm">) {
    setSalvando(true);
    try {
      await adicionarGasto(gasto);
    } finally {
      setSalvando(false);
    }
  }

  async function atualizar(id: string, gasto: Omit<Gasto, "id" | "criadoEm">) {
    setSalvando(true);
    try {
      await atualizarGasto(id, gasto);
    } finally {
      setSalvando(false);
    }
  }

  function remover(gasto: Gasto) {
    if (!gasto.id) return;
    const confirmou = window.confirm(`Remover o gasto "${gasto.descricao}"?`);
    if (confirmou) removerGasto(gasto);
  }

  return { gastos, salvando, adicionar, atualizar, remover };
}