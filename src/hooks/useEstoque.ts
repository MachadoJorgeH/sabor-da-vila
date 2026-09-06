import { useCallback, useEffect, useState } from "react";
import {
  listarEstoque,
  adicionarItem,
  removerItem,
} from "../services/estoqueService";
import type { ItemEstoque } from "../types/estoque";

export function useEstoque() {
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setItens(await listarEstoque());
    } catch (erro) {
      console.error("Falha ao carregar o estoque:", erro);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionar(item: Omit<ItemEstoque, "id">) {
    setSalvando(true);
    try {
      await adicionarItem(item);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(item: ItemEstoque) {
    if (!item.id) return;
    setSalvando(true);
    try {
      await removerItem(item);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  return { itens, salvando, adicionar, remover };
}