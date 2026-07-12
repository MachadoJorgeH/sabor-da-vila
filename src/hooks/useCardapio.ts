import { useEffect, useState } from "react";
import {
  ouvirCardapio,
  adicionarItemCardapio,
  atualizarItemCardapio,
  removerItemCardapio,
} from "../services/cardapioService";
import type { ItemCardapio } from "../types/cardapio";

export function useCardapio() {
  const [itens, setItens] = useState<ItemCardapio[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const unsubscribe = ouvirCardapio(setItens);
    return () => unsubscribe();
  }, []);

  async function adicionar(item: Omit<ItemCardapio, "id">) {
    setSalvando(true);
    try {
      await adicionarItemCardapio(item);
    } finally {
      setSalvando(false);
    }
  }

  async function atualizar(id: string, item: Omit<ItemCardapio, "id">) {
    setSalvando(true);
    try {
      await atualizarItemCardapio(id, item);
    } finally {
      setSalvando(false);
    }
  }

  function remover(item: ItemCardapio) {
    if (!item.id) return;
    const confirmou = window.confirm(`Remover "${item.nome}" do cardápio?`);
    if (confirmou) removerItemCardapio(item);
  }

  return { itens, salvando, adicionar, atualizar, remover };
}