import type { Timestamp } from "firebase/firestore";

export interface ItemEstoque {
  id?: string;
  nome: string;
  quantidade: number;
  unidade: string; // "un", "kg", "L", etc.
  custo: number;   // quanto foi gasto (total) na compra desse item
  criadoEm: Timestamp; // timestamp
}