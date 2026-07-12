import { useEffect, useMemo, useState } from "react";
import { ouvirVendas } from "../services/vendasService";
import { ouvirGastos } from "../services/gastosService";
import type { Venda } from "../types/venda";
import type { Gasto } from "../types/gasto";
import type { OrigemPedido } from "../types/pedido";

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function somarPorData<T extends { criadoEm?: { toDate: () => Date } }>(
  registros: T[],
  pegarValor: (item: T) => number,
  filtro: (data: Date) => boolean
) {
  return registros
    .filter((r) => r.criadoEm && filtro(r.criadoEm.toDate()))
    .reduce((total, r) => total + pegarValor(r), 0);
}

export function useFinanceiro() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);

  useEffect(() => {
    // 35 dias cobre com folga "este mês" (até 31 dias) + os 7 dias do gráfico,
    // sem precisar carregar o histórico de vendas/gastos inteiro a cada visita.
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 35);
    inicio.setHours(0, 0, 0, 0);

    const unsubVendas = ouvirVendas(setVendas, { inicio });
    const unsubGastos = ouvirGastos(setGastos, { inicio });
    return () => {
      unsubVendas();
      unsubGastos();
    };
  }, []);

  const resumo = useMemo(() => {
    const agora = new Date();
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(agora.getDate() - 6);
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    return {
      vendasHoje: somarPorData(vendas, (v) => v.total, (d) => mesmoDia(d, agora)),
      gastosHoje: somarPorData(gastos, (g) => g.valor, (d) => mesmoDia(d, agora)),

      vendasSemana: somarPorData(vendas, (v) => v.total, (d) => d >= inicioSemana),
      gastosSemana: somarPorData(gastos, (g) => g.valor, (d) => d >= inicioSemana),

      vendasMes: somarPorData(vendas, (v) => v.total, (d) => d >= inicioMes),
      gastosMes: somarPorData(gastos, (g) => g.valor, (d) => d >= inicioMes),
    };
  }, [vendas, gastos]);

  const porCanalMes = useMemo(() => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const totais: Record<OrigemPedido, number> = { salao: 0, app: 0 };

    for (const venda of vendas) {
      if (!venda.criadoEm || venda.criadoEm.toDate() < inicioMes) continue;
      const origem = venda.origem ?? "salao";
      totais[origem] += venda.total;
    }

    return totais;
  }, [vendas]);

  const chartData = useMemo(() => {
    const dias = Array.from({ length: 7 }).map((_, i) => {
      const data = new Date();
      data.setDate(data.getDate() - (6 - i));
      return data;
    });

    return dias.map((dia) => ({
      dia: dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      vendas: somarPorData(vendas, (v) => v.total, (d) => mesmoDia(d, dia)),
      gastos: somarPorData(gastos, (g) => g.valor, (d) => mesmoDia(d, dia)),
    }));
  }, [vendas, gastos]);

  return { resumo, chartData, porCanalMes };
}