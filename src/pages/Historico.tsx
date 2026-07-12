import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Store, Bike, Archive } from "lucide-react";
import { useHistorico } from "../hooks/useHistorico";
import { LABEL_ORIGEM } from "../types/pedido";
import type { OrigemPedido } from "../types/pedido";
import { formatarDataHora } from "../utils/formatDate";
import { formatarMoeda } from "../utils/formatCurrency";

function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

type FiltroOrigem = "todos" | OrigemPedido;

export default function Historico() {
  const [searchParams, setSearchParams] = useSearchParams();

  const data = searchParams.get("data") ?? hojeISO();
  const origem = (searchParams.get("origem") as FiltroOrigem) ?? "todos";
  const busca = searchParams.get("q") ?? "";

  const { vendas, carregando } = useHistorico(data);

  function atualizarFiltro(chave: string, valor: string) {
    const proximos = new URLSearchParams(searchParams);
    if (valor) {
      proximos.set(chave, valor);
    } else {
      proximos.delete(chave);
    }
    setSearchParams(proximos);
  }

  function limparFiltros() {
    setSearchParams({});
  }

  const vendasFiltradas = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();

    return vendas.filter((venda) => {
      const origemVenda = venda.origem ?? "salao";
      if (origem !== "todos" && origemVenda !== origem) return false;

      if (buscaNormalizada) {
        const bateMesa = venda.mesa.toLowerCase().includes(buscaNormalizada);
        const bateItem = venda.itens.some((item) =>
          item.nome.toLowerCase().includes(buscaNormalizada)
        );
        if (!bateMesa && !bateItem) return false;
      }

      return true;
    });
  }, [vendas, origem, busca]);

  const totalFiltrado = vendasFiltradas.reduce((soma, v) => soma + v.total, 0);

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
            Registro
          </span>
          <h1 className="font-heading font-semibold text-text text-xl md:text-2xl leading-tight">
            Histórico de pedidos
          </h1>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
            {vendasFiltradas.length} {vendasFiltradas.length === 1 ? "venda" : "vendas"}
          </span>
          <span className="font-mono text-base md:text-lg font-semibold text-gold">
            {formatarMoeda(totalFiltrado)}
          </span>
        </div>
      </div>

      <div className="bg-card-soft rounded-lg shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div>
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => atualizarFiltro("data", e.target.value)}
              className="w-full sm:w-44 border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
            />
          </div>

          <div className="flex-1 sm:min-w-48">
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Buscar
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={busca}
                onChange={(e) => atualizarFiltro("q", e.target.value)}
                placeholder="Mesa, código do pedido ou item…"
                className="w-full border border-border rounded-md pl-9 pr-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={limparFiltros}
            className="text-sm font-heading text-text-muted hover:text-text py-3 sm:py-2 px-3 rounded-md transition-colors"
          >
            Limpar filtros
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => atualizarFiltro("origem", "")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-md text-sm font-heading font-semibold border transition-colors ${
              origem === "todos"
                ? "border-gold text-gold bg-gold/5"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => atualizarFiltro("origem", "salao")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-heading font-semibold border transition-colors ${
              origem === "salao"
                ? "border-gold text-gold bg-gold/5"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            <Store size={15} /> Salão
          </button>
          <button
            type="button"
            onClick={() => atualizarFiltro("origem", "app")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-heading font-semibold border transition-colors ${
              origem === "app"
                ? "border-gold text-gold bg-gold/5"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            <Bike size={15} /> App / Delivery
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border border-t-2 border-t-gold rounded-sm">
        <div className="flex items-center gap-2 px-4 md:px-6 py-4">
          <Archive size={15} className="text-olive" strokeWidth={2} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            {carregando ? "Carregando…" : `${vendasFiltradas.length} ${vendasFiltradas.length === 1 ? "registro" : "registros"}`}
          </span>
        </div>

        <div className="border-t border-dashed border-gold/25" />

        <ul>
          {vendasFiltradas.map((venda, idx) => {
            const origemVenda = venda.origem ?? "salao";
            return (
              <li key={venda.id} className="group relative">
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-out" />
                <div className="flex items-center gap-3 px-4 md:px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-text">{venda.mesa}</p>
                      <span
                        className={`flex items-center gap-1 font-mono text-[9px] tracking-wide uppercase ${
                          origemVenda === "app" ? "text-olive" : "text-text-muted"
                        }`}
                      >
                        {origemVenda === "app" ? <Bike size={10} /> : <Store size={10} />}
                        {LABEL_ORIGEM[origemVenda]}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-text-muted mt-0.5 truncate">
                      {venda.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(", ")}
                    </p>
                    {venda.observacao && (
                      <p className="text-xs text-paprika/90 mt-0.5 truncate">Obs: {venda.observacao}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-mono text-sm font-semibold text-gold">
                      {formatarMoeda(venda.total)}
                    </span>
                    <span className="block font-mono text-[10px] text-text-muted mt-0.5">
                      {formatarDataHora(venda.criadoEm)}
                    </span>
                  </div>
                </div>
                {idx < vendasFiltradas.length - 1 && (
                  <div className="border-t border-dashed border-gold/25 mx-4 md:mx-6" />
                )}
              </li>
            );
          })}

          {!carregando && vendasFiltradas.length === 0 && (
            <li className="px-6 py-12 text-center text-text-muted">
              <Archive size={24} className="mx-auto mb-2" />
              Nenhuma venda encontrada com esses filtros
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
