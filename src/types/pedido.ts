import type { Timestamp } from "firebase/firestore";

export type StatusPedido = "recebido" | "em_preparo" | "pronto" | "entregue";

export type OrigemPedido = "salao" | "app";

export const LABEL_ORIGEM: Record<OrigemPedido, string> = {
  salao: "Salão",
  app: "App / Delivery",
};

export interface ItemPedido {
  cardapioId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
}

export interface Pedido {
  id?: string;
  mesa: string;
  origem: OrigemPedido;
  itens: ItemPedido[];
  observacao?: string;
  status: StatusPedido;
  criadoEm: Timestamp;
}

export const PROXIMO_STATUS: Record<StatusPedido, StatusPedido | null> = {
  recebido: "em_preparo",
  em_preparo: "pronto",
  pronto: "entregue",
  entregue: null,
};

export const LABEL_STATUS: Record<StatusPedido, string> = {
  recebido: "Recebido",
  em_preparo: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue",
};

export function totalPedido(pedido: Pedido): number {
  return pedido.itens.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0);
}