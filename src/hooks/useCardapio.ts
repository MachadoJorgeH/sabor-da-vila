import { useCallback, useEffect, useState } from "react";
import {
  listarCardapio,
  adicionarItemCardapio,
  atualizarItemCardapio,
  removerItemCardapio,
} from "../services/cardapioService";
import type { ItemCardapio } from "../types/cardapio";

export function useCardapio() {
  const [itens, setItens] = useState<ItemCardapio[]>([]);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setItens(await listarCardapio());
    } catch (erro) {
      console.error("Falha ao carregar o cardápio:", erro);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionar(item: Omit<ItemCardapio, "id">) {
    setSalvando(true);
    try {
      await adicionarItemCardapio(item);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function atualizar(id: string, item: Omit<ItemCardapio, "id">) {
    setSalvando(true);
    try {
      await atualizarItemCardapio(id, item);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

    async function remover(item: ItemCardapio) {
    if (!item.id) return;
    setSalvando(true);
    try {
      await removerItemCardapio(item);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  return { itens, salvando, adicionar, atualizar, remover };
}