import { useEffect, useState } from "react";
import {
  ouvirEstoque,
  adicionarItem,
  removerItem,
} from "../services/estoqueService";
import type { ItemEstoque } from "../types/estoque";

export function useEstoque() {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const unsubscribe = ouvirEstoque(setItens);
    return () => unsubscribe();
  }, []);

  async function adicionar(item: Omit<ItemEstoque, "id" | "criadoEm">) {
    setSalvando(true);
    try {
      await adicionarItem(item);
    } finally {
      setSalvando(false);
    }
  }

  function remover(item: ItemEstoque) {
    if (!item.id) return;
    const confirmou = window.confirm(`Remover "${item.nome}" do estoque?`);
    if (confirmou) removerItem(item);
  }

  return { itens, salvando, adicionar, remover };
}
