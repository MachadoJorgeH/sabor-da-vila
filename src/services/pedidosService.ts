import * as signalR from "@microsoft/signalr";
import { api, API_BASE_URL } from "../api/client";
import type { Pedido, ItemPedido, OrigemPedido, StatusPedido } from "../types/pedido";

interface OrderItemApi {
  id: string;
  menuItemId: string | null;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

interface OrderApi {
  id: string;
  tableLabel: string;
  origin: string;
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemApi[];
}

const STATUS_DA_API: Record<string, StatusPedido> = {
  received: "recebido",
  preparing: "em_preparo",
  ready: "pronto",
  delivered: "entregue",
};

const ORIGEM_DA_API: Record<string, OrigemPedido> = {
  hall: "salao",
  app: "app",
};

const ORIGEM_PARA_API: Record<OrigemPedido, string> = {
  salao: "hall",
  app: "app",
};

function paraPedido(order: OrderApi): Pedido {
  return {
    id: order.id,
    mesa: order.tableLabel,
    origem: ORIGEM_DA_API[order.origin] ?? "salao",
    status: STATUS_DA_API[order.status] ?? "recebido",
    observacao: order.note ?? undefined,
    criadoEm: order.createdAt,
    itens: order.items.map((item) => ({
      cardapioId: item.menuItemId ?? "",
      nome: item.name,
      precoUnitario: item.unitPriceCents / 100,
      quantidade: item.quantity,
    })),
  };
}

export async function listarPedidos(): Promise<Pedido[]> {
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);
  const dados = await api.get<OrderApi[]>(
    `/api/orders?since=${inicioDoDia.toISOString()}`,
  );
  return dados.map(paraPedido);
}

export async function criarPedido(
  mesa: string,
  origem: OrigemPedido,
  observacao: string | undefined,
  itens: ItemPedido[],
) {
  await api.post("/api/orders", {
    tableLabel: mesa,
    origin: ORIGEM_PARA_API[origem],
    note: observacao ?? null,
    items: itens.map((item) => ({
      menuItemId: item.cardapioId,
      quantity: item.quantidade,
    })),
  });
}

export async function avancarStatusPedido(id: string) {
  await api.post(`/api/orders/${id}/advance`);
}

export async function removerPedido(id: string) {
  await api.delete(`/api/orders/${id}`);
}

export function conectarPedidos(aoMudar: () => void): signalR.HubConnection {
  const conexao = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/orders`)
    .withAutomaticReconnect()
    .build();

  conexao.on("OrdersChanged", aoMudar);
  conexao.onreconnected(aoMudar);
  conexao.start().catch((erro) =>
    console.error("Falha ao conectar no hub de pedidos:", erro),
  );

  return conexao;
}
