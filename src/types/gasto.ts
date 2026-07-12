import type { Timestamp } from "firebase/firestore";

export const CATEGORIAS_GASTO = [
  "Aluguel",
  "Fornecedores",
  "Contas (água/luz/internet)",
  "Funcionários",
  "Manutenção",
  "Outros",
] as const;

export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

export interface Gasto {
  id?: string;
  descricao: string;
  categoria: CategoriaGasto;
  valor: number;
  criadoEm: Timestamp;
}