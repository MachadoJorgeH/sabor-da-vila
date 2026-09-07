import { api } from "../api/client";
import type { OrigemPedido } from "../types/pedido";

interface DailyApi {
  day: string;
  revenueCents: number;
  salesCount: number;
  expenseCents: number;
}

interface ChannelApi {
  origin: string;
  revenueCents: number;
  salesCount: number;
}

export interface DiaFinanceiro {
  dia: string;
  vendas: number;
  gastos: number;
}

const ORIGEM_DA_API: Record<string, OrigemPedido> = {
  hall: "salao",
  app: "app",
};

function paraDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export async function buscarSerieDiaria(inicio: Date, fim: Date): Promise<DiaFinanceiro[]> {
  const params = new URLSearchParams({
    from: paraDataISO(inicio),
    to: paraDataISO(fim),
  });
  const dados = await api.get<DailyApi[]>(`/api/finance/daily?${params}`);
  return dados.map((d) => ({
    dia: d.day,
    vendas: d.revenueCents / 100,
    gastos: d.expenseCents / 100,
  }));
}

export async function buscarPorCanal(
  inicio: Date,
  fim: Date,
): Promise<Record<OrigemPedido, number>> {
  const params = new URLSearchParams({
    from: inicio.toISOString(),
    to: fim.toISOString(),
  });
  const dados = await api.get<ChannelApi[]>(`/api/finance/by-channel?${params}`);

  const totais: Record<OrigemPedido, number> = { salao: 0, app: 0 };
  for (const linha of dados) {
    const origem = ORIGEM_DA_API[linha.origin] ?? "salao";
    totais[origem] += linha.revenueCents / 100;
  }
  return totais;
}
