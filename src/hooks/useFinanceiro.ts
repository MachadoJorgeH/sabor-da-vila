import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarSerieDiaria, buscarPorCanal } from "../services/financeService";
import type { DiaFinanceiro } from "../services/financeService";
import type { OrigemPedido } from "../types/pedido";

const DIAS_JANELA = 35;

function formatarDiaMes(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function useFinanceiro() {
  const [serie, setSerie] = useState<DiaFinanceiro[]>([]);
  const [porCanalMes, setPorCanalMes] = useState<Record<OrigemPedido, number>>({
    salao: 0,
    app: 0,
  });

  const carregar = useCallback(async () => {
    try {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const [dias, canais] = await Promise.all([
        buscarSerieDiaria(DIAS_JANELA),
        buscarPorCanal(inicioMes, agora),
      ]);
      setSerie(dias);
      setPorCanalMes(canais);
    } catch (erro) {
      console.error("Falha ao carregar o financeiro:", erro);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const resumo = useMemo(() => {
    const agora = new Date();
    const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
    const hojeStr = `${mesAtual}-${String(agora.getDate()).padStart(2, "0")}`;

    const somar = (dias: DiaFinanceiro[], campo: "vendas" | "gastos") =>
      dias.reduce((total, d) => total + d[campo], 0);

    const doDia = serie.filter((d) => d.dia === hojeStr);
    const ultimos7 = serie.slice(-7);
    const doMes = serie.filter((d) => d.dia.startsWith(mesAtual));

    return {
      vendasHoje: somar(doDia, "vendas"),
      gastosHoje: somar(doDia, "gastos"),
      vendasSemana: somar(ultimos7, "vendas"),
      gastosSemana: somar(ultimos7, "gastos"),
      vendasMes: somar(doMes, "vendas"),
      gastosMes: somar(doMes, "gastos"),
    };
  }, [serie]);

  const chartData = useMemo(() => {
    return serie.slice(-7).map((d) => ({
      dia: formatarDiaMes(d.dia),
      vendas: d.vendas,
      gastos: d.gastos,
    }));
  }, [serie]);

  return { resumo, chartData, porCanalMes };
}
