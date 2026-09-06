import { useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Store,
  Bike,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Gastos from "./Gastos";
import { useFinanceiro } from "../hooks/useFinanceiro";
import { formatarMoeda } from "../utils/formatCurrency";

type Aba = "geral" | "gastos";

function CardResumo({ titulo, vendas, gastos }: { titulo: string; vendas: number; gastos: number }) {
  const saldo = vendas - gastos;

  return (
    <div className="bg-card-soft rounded-lg shadow-sm p-4 md:p-5">
      <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
        {titulo}
      </span>

      <div className="space-y-1.5 mt-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Vendas</span>
          <span className="font-mono font-medium text-olive">{formatarMoeda(vendas)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Gastos</span>
          <span className="font-mono font-medium text-paprika">{formatarMoeda(gastos)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gold/25 mt-3 pt-3">
        <div
          className={`flex justify-between items-center rounded-md px-3 py-2.5 ${
            saldo >= 0 ? "bg-gold-gradient-diagonal" : "bg-paprika"
          }`}
        >
          <span className="font-heading font-semibold text-sm" style={{ color: saldo >= 0 ? "#241C10" : "#fff" }}>
            Saldo
          </span>
          <span className="font-mono font-bold text-sm" style={{ color: saldo >= 0 ? "#241C10" : "#fff" }}>
            {formatarMoeda(saldo)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Financeiro() {
  const [searchParams, setSearchParams] = useSearchParams();
  const abaParam = searchParams.get("aba");
  const aba: Aba = abaParam === "gastos" ? "gastos" : "geral";

  function setAba(novaAba: Aba) {
    setSearchParams(novaAba === "geral" ? {} : { aba: novaAba });
  }

  const {
    mesSelecionado,
    irParaMesAnterior,
    irParaProximoMes,
    podeAvancar,
    ehMesAtual,
    resumoHoje,
    resumoSemana,
    resumoMes,
    chartData,
    porCanalMes,
  } = useFinanceiro();

  const labelMes = mesSelecionado.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 md:space-y-8">
      <div>
        <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
          Painel
        </span>
        <h1 className="font-heading font-semibold text-text text-xl md:text-2xl leading-tight">
          Financeiro
        </h1>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        <button
          onClick={() => setAba("geral")}
          className={`shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-heading font-semibold border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            aba === "geral"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <LayoutDashboard size={16} />
          Visão Geral
        </button>
        <button
          onClick={() => setAba("gastos")}
          className={`shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-heading font-semibold border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            aba === "gastos"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Receipt size={16} />
          Gastos
        </button>
      </div>

      {aba === "geral" && (
        <div className="space-y-5 md:space-y-6">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={irParaMesAnterior}
              aria-label="Mês anterior"
              className="p-2 rounded-full text-text-muted hover:text-gold hover:bg-gold/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-heading font-semibold text-text capitalize min-w-44 text-center">
              {labelMes}
            </span>
            <button
              onClick={irParaProximoMes}
              disabled={!podeAvancar}
              aria-label="Próximo mês"
              className="p-2 rounded-full text-text-muted hover:text-gold hover:bg-gold/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {ehMesAtual ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CardResumo titulo="Hoje" vendas={resumoHoje.vendas} gastos={resumoHoje.gastos} />
              <CardResumo titulo="Últimos 7 dias" vendas={resumoSemana.vendas} gastos={resumoSemana.gastos} />
              <CardResumo titulo={labelMes} vendas={resumoMes.vendas} gastos={resumoMes.gastos} />
            </div>
          ) : (
            <CardResumo titulo={labelMes} vendas={resumoMes.vendas} gastos={resumoMes.gastos} />
          )}

          <div className="bg-surface border border-border border-t-2 border-t-gold rounded-sm p-4 md:p-6">
            <h3 className="font-heading font-semibold text-text mb-4 text-sm md:text-base">
              Vendas por canal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Store size={16} className="text-gold" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <span className="block font-mono text-[10px] tracking-widest uppercase text-text-muted">
                    Salão
                  </span>
                  <span className="font-mono text-sm font-semibold text-text">
                    {formatarMoeda(porCanalMes.salao)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-olive/10 flex items-center justify-center shrink-0">
                  <Bike size={16} className="text-olive" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <span className="block font-mono text-[10px] tracking-widest uppercase text-text-muted">
                    App / Delivery
                  </span>
                  <span className="font-mono text-sm font-semibold text-text">
                    {formatarMoeda(porCanalMes.app)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-soft rounded-lg shadow-sm p-4 md:p-6">
            <h3 className="font-heading font-semibold text-text mb-4 text-sm md:text-base">
              Vendas x Gastos por dia
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="dia" stroke="var(--color-text-muted)" fontSize={11} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar dataKey="vendas" fill="var(--color-gold)" name="Vendas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" fill="var(--color-paprika)" name="Gastos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {aba === "gastos" && <Gastos />}
    </div>
  );
}
