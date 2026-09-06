import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarSerieDiaria, buscarPorCanal } from "../services/financeService";
import type { DiaFinanceiro } from "../services/financeService";
import type { OrigemPedido } from "../types/pedido";

function primeiroDiaDoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function somar(serie: DiaFinanceiro[]) {
  return {
    vendas: serie.reduce((total, d) => total + d.vendas, 0),
    gastos: serie.reduce((total, d) => total + d.gastos, 0),
  };
}

export function useFinanceiro() {
  const [mesSelecionado, setMesSelecionado] = useState<Date>(() =>
    primeiroDiaDoMes(new Date()),
  );
  const [serie, setSerie] = useState<DiaFinanceiro[]>([]);
  const [serieRecente, setSerieRecente] = useState<DiaFinanceiro[]>([]);
  const [porCanalMes, setPorCanalMes] = useState<Record<OrigemPedido, number>>({
    salao: 0,
    app: 0,
  });

  const carregar = useCallback(async () => {
    const ano = mesSelecionado.getFullYear();
    const mes = mesSelecionado.getMonth();
    const inicio = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const proximoMes = new Date(ano, mes + 1, 1);

    const hoje = new Date();
    const seteDiasAtras = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 6);

    try {
      const [dias, canais, recentes] = await Promise.all([
        buscarSerieDiaria(inicio, ultimoDia),
        buscarPorCanal(inicio, proximoMes),
        buscarSerieDiaria(seteDiasAtras, hoje),
      ]);
      setSerie(dias);
      setPorCanalMes(canais);
      setSerieRecente(recentes);
    } catch (erro) {
      console.error("Falha ao carregar o financeiro:", erro);
    }
  }, [mesSelecionado]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function irParaMesAnterior() {
    setMesSelecionado((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  function irParaProximoMes() {
    setMesSelecionado((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  const ehMesAtual = useMemo(
    () => mesSelecionado.getTime() === primeiroDiaDoMes(new Date()).getTime(),
    [mesSelecionado],
  );

  const resumoMes = useMemo(() => somar(serie), [serie]);
  const resumoSemana = useMemo(() => somar(serieRecente), [serieRecente]);
  const resumoHoje = useMemo(() => {
    const hoje = serieRecente[serieRecente.length - 1];
    return { vendas: hoje?.vendas ?? 0, gastos: hoje?.gastos ?? 0 };
  }, [serieRecente]);

  const chartData = useMemo(
    () =>
      serie.map((d) => ({
        dia: d.dia.slice(8, 10),
        vendas: d.vendas,
        gastos: d.gastos,
      })),
    [serie],
  );

  return {
    mesSelecionado,
    irParaMesAnterior,
    irParaProximoMes,
    podeAvancar: !ehMesAtual,
    ehMesAtual,
    resumoHoje,
    resumoSemana,
    resumoMes,
    chartData,
    porCanalMes,
  };
}
