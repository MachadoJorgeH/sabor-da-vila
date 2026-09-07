import { useCallback, useEffect, useState } from "react";
import {
  listarCardapio,
  adicionarItemCardapio,
  atualizarItemCardapio,
  removerItemCardapio,
  enviarFotoItem,
  removerFotoItem,
} from "../services/cardapioService";
import type { ItemCardapio, FotoAcao } from "../types/cardapio";

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

  async function adicionar(item: Omit<ItemCardapio, "id">, foto: FotoAcao) {
    setSalvando(true);
    try {
      const criado = await adicionarItemCardapio(item);
      if (foto.tipo === "nova" && criado.id) {
        await enviarFotoItem(criado.id, foto.arquivo);
      }
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function atualizar(id: string, item: Omit<ItemCardapio, "id">, foto: FotoAcao) {
    setSalvando(true);
    try {
      await atualizarItemCardapio(id, item);
      if (foto.tipo === "nova") {
        await enviarFotoItem(id, foto.arquivo);
      } else if (foto.tipo === "remover") {
        await removerFotoItem(id);
      }
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
