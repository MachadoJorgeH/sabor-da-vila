import { useCallback, useEffect, useState } from "react";
import {
  listarPedidos,
  criarPedido,
  avancarStatusPedido,
  removerPedido,
  conectarPedidos,
} from "../services/pedidosService";
import type { Pedido, ItemPedido, OrigemPedido } from "../types/pedido";

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setPedidos(await listarPedidos());
    } catch (erro) {
      console.error("Falha ao carregar os pedidos:", erro);
    }
  }, []);

  useEffect(() => {
    carregar();
    const conexao = conectarPedidos(carregar);
    return () => {
      conexao.stop();
    };
  }, [carregar]);

  async function criar(
    mesa: string,
    itens: ItemPedido[],
    origem: OrigemPedido = "salao",
    observacao?: string,
  ) {
    setSalvando(true);
    try {
      await criarPedido(mesa, origem, observacao?.trim() || undefined, itens);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function avancarStatus(pedido: Pedido) {
    if (!pedido.id) return;
    await avancarStatusPedido(pedido.id);
    await carregar();
  }

  async function remover(pedido: Pedido) {
    if (!pedido.id) return;
    setSalvando(true);
    try {
      await removerPedido(pedido.id);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  return { pedidos, salvando, avancarStatus, criar, remover };
}
