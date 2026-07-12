import { useEffect, useState } from "react";
import {
  ouvirPedidos,
  criarPedido,
  atualizarStatusPedido,
  removerPedido,
} from "../services/pedidosService";
import { registrarVenda } from "../services/vendasService";
import { PROXIMO_STATUS, totalPedido } from "../types/pedido";
import type { Pedido, ItemPedido, OrigemPedido } from "../types/pedido";

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const unsubscribe = ouvirPedidos(setPedidos);
    return () => unsubscribe();
  }, []);

  async function criar(
    mesa: string,
    itens: ItemPedido[],
    origem: OrigemPedido = "salao",
    observacao?: string
  ) {
    setSalvando(true);
    try {
      await criarPedido({
        mesa,
        origem,
        itens,
        status: "recebido",
        ...(observacao?.trim() ? { observacao: observacao.trim() } : {}),
      });
    } finally {
      setSalvando(false);
    }
  }

  async function avancarStatus(pedido: Pedido) {
    if (!pedido.id) return;
    const proximo = PROXIMO_STATUS[pedido.status];
    if (!proximo) return;

    await atualizarStatusPedido(pedido, proximo);

    if (proximo === "entregue") {
      await registrarVenda({
        pedidoId: pedido.id,
        mesa: pedido.mesa,
        origem: pedido.origem ?? "salao",
        itens: pedido.itens,
        ...(pedido.observacao ? { observacao: pedido.observacao } : {}),
        total: totalPedido(pedido),
      });
    }
  }

  function remover(pedido: Pedido) {
    if (!pedido.id) return;
    const confirmou = window.confirm(`Remover pedido da mesa ${pedido.mesa}?`);
    if (confirmou) removerPedido(pedido);
  }

  return { pedidos, salvando, avancarStatus, criar, remover };
}
