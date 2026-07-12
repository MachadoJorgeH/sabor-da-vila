import type { Timestamp } from "firebase/firestore";
import type { ItemPedido, OrigemPedido } from "./pedido";

export interface Venda {
  id?: string;
  pedidoId: string;
  mesa: string;
  origem: OrigemPedido;
  itens: ItemPedido[];
  observacao?: string;
  total: number;
  criadoEm: Timestamp;
}