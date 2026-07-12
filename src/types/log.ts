import type { Timestamp } from "firebase/firestore";

export type AcaoLog = "criar" | "atualizar" | "remover";
export type EntidadeLog = "pedido" | "cardapio" | "estoque" | "gasto";

export const LABEL_ACAO: Record<AcaoLog, string> = {
  criar: "Criou",
  atualizar: "Atualizou",
  remover: "Removeu",
};

export const LABEL_ENTIDADE: Record<EntidadeLog, string> = {
  pedido: "Pedido",
  cardapio: "Cardápio",
  estoque: "Estoque",
  gasto: "Gasto",
};

export interface LogAuditoria {
  id?: string;
  acao: AcaoLog;
  entidade: EntidadeLog;
  descricao: string;
  usuarioEmail: string;
  criadoEm: Timestamp;
}
