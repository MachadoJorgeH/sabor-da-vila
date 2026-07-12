import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ScrollText, Plus, Pencil, Trash2 } from "lucide-react";
import { useLogs } from "../hooks/useLogs";
import { LABEL_ACAO, LABEL_ENTIDADE } from "../types/log";
import type { AcaoLog, EntidadeLog } from "../types/log";
import { formatarDataHora } from "../utils/formatDate";

function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

const ICONE_ACAO: Record<AcaoLog, typeof Plus> = {
  criar: Plus,
  atualizar: Pencil,
  remover: Trash2,
};

const COR_ACAO: Record<AcaoLog, string> = {
  criar: "text-olive",
  atualizar: "text-gold",
  remover: "text-paprika",
};

type FiltroEntidade = "todos" | EntidadeLog;

export default function Logs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const data = searchParams.get("data") ?? hojeISO();
  const entidade = (searchParams.get("entidade") as FiltroEntidade) ?? "todos";
  const busca = searchParams.get("q") ?? "";

  const { logs, carregando } = useLogs(data);

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

  const logsFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();

    return logs.filter((log) => {
      if (entidade !== "todos" && log.entidade !== entidade) return false;

      if (buscaNormalizada) {
        const bateDescricao = log.descricao.toLowerCase().includes(buscaNormalizada);
        const bateUsuario = log.usuarioEmail.toLowerCase().includes(buscaNormalizada);
        if (!bateDescricao && !bateUsuario) return false;
      }

      return true;
    });
  }, [logs, entidade, busca]);

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
            Auditoria
          </span>
          <h1 className="font-heading font-semibold text-text text-xl md:text-2xl leading-tight">
            Logs
          </h1>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
            {logsFiltrados.length === 1 ? "registro" : "registros"}
          </span>
          <span className="font-mono text-base md:text-lg font-semibold text-gold">
            {logsFiltrados.length}
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

          <div className="sm:w-52">
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Área
            </label>
            <select
              value={entidade}
              onChange={(e) => atualizarFiltro("entidade", e.target.value)}
              className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
            >
              <option value="todos">Todas</option>
              <option value="pedido">Pedido</option>
              <option value="cardapio">Cardápio</option>
              <option value="estoque">Estoque</option>
              <option value="gasto">Gasto</option>
            </select>
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
                placeholder="Descrição ou usuário…"
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
      </div>

      <div className="bg-surface border border-border border-t-2 border-t-gold rounded-sm">
        <div className="flex items-center gap-2 px-4 md:px-6 py-4">
          <ScrollText size={15} className="text-olive" strokeWidth={2} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            {carregando ? "Carregando…" : `${logsFiltrados.length} ${logsFiltrados.length === 1 ? "registro" : "registros"} nesse dia`}
          </span>
        </div>

        <div className="border-t border-dashed border-gold/25" />

        <ul>
          {logsFiltrados.map((log, idx) => {
            const Icone = ICONE_ACAO[log.acao];
            return (
              <li key={log.id} className="group relative">
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-out" />
                <div className="flex items-center gap-3 px-4 md:px-6 py-4">
                  <div className={`w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center shrink-0 ${COR_ACAO[log.acao]}`}>
                    <Icone size={14} strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-mono text-[9px] tracking-wide uppercase ${COR_ACAO[log.acao]}`}>
                        {LABEL_ACAO[log.acao]}
                      </span>
                      <span className="font-mono text-[9px] tracking-wide uppercase text-text-muted bg-surface-alt rounded px-1.5 py-0.5">
                        {LABEL_ENTIDADE[log.entidade]}
                      </span>
                    </div>
                    <p className="text-sm text-text mt-0.5 truncate">{log.descricao}</p>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5 truncate">
                      {log.usuarioEmail}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-text-muted shrink-0">
                    {formatarDataHora(log.criadoEm)}
                  </span>
                </div>
                {idx < logsFiltrados.length - 1 && (
                  <div className="border-t border-dashed border-gold/25 mx-4 md:mx-6" />
                )}
              </li>
            );
          })}

          {!carregando && logsFiltrados.length === 0 && (
            <li className="px-6 py-12 text-center text-text-muted">
              <ScrollText size={24} className="mx-auto mb-2" />
              Nenhum registro encontrado com esses filtros
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
