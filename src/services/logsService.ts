import { api } from "../api/client";
import type { AcaoLog, EntidadeLog, LogAuditoria } from "../types/log";

interface AuditLogApi {
  id: number;
  action: string;
  entity: string;
  description: string;
  userId: string | null;
  userEmail: string;
  createdAt: string;
}

const ACAO_DA_API: Record<string, AcaoLog> = {
  create: "criar",
  update: "atualizar",
  delete: "remover",
};

const ENTIDADE_DA_API: Record<string, EntidadeLog> = {
  menu: "cardapio",
  inventory: "estoque",
  expense: "gasto",
  order: "pedido",
};

function paraLog(entry: AuditLogApi): LogAuditoria {
  return {
    id: String(entry.id),
    acao: ACAO_DA_API[entry.action] ?? "atualizar",
    entidade: ENTIDADE_DA_API[entry.entity] ?? "cardapio",
    descricao: entry.description,
    usuarioEmail: entry.userEmail,
    criadoEm: entry.createdAt,
  };
}

export async function listarLogs(inicio: Date, fim: Date): Promise<LogAuditoria[]> {
  const params = new URLSearchParams({
    from: inicio.toISOString(),
    to: fim.toISOString(),
  });
  const dados = await api.get<AuditLogApi[]>(`/api/logs?${params}`);
  return dados.map(paraLog);
}
