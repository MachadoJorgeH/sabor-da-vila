import { useState } from "react";
import { Plus, Pencil, Trash2, Receipt, X } from "lucide-react";
import { useGastos } from "../hooks/useGastos";
import { CATEGORIAS_GASTO } from "../types/gasto";
import type { Gasto, CategoriaGasto } from "../types/gasto";
import { formatarDataHora } from "../utils/formatDate";
import { formatarMoeda } from "../utils/formatCurrency";

export default function Gastos() {
  const { gastos, salvando, adicionar, atualizar, remover } = useGastos();

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState<CategoriaGasto>(CATEGORIAS_GASTO[0]);

  function iniciarEdicao(gasto: Gasto) {
    setEditandoId(gasto.id ?? null);
    setDescricao(gasto.descricao);
    setValor(String(gasto.valor));
    setCategoria(gasto.categoria);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setDescricao("");
    setValor("");
    setCategoria(CATEGORIAS_GASTO[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao || !valor) return;

    const dados = { descricao, valor: Number(valor), categoria };

    if (editandoId) {
      await atualizar(editandoId, dados);
    } else {
      await adicionar(dados);
    }

    cancelarEdicao();
  }

  const totalGastos = gastos.reduce((soma, gasto) => soma + gasto.valor, 0);

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
            Financeiro
          </span>
          <h1 className="font-heading font-semibold text-text text-xl md:text-2xl leading-tight">
            Gastos
          </h1>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
            Total
          </span>
          <span className="font-mono text-base md:text-lg font-semibold text-paprika">
            {formatarMoeda(totalGastos)}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card-soft rounded-lg shadow-sm p-4 md:p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
            {editandoId ? (
              <Pencil size={14} className="text-gold-contrast" strokeWidth={2.25} />
            ) : (
              <Plus size={16} className="text-gold-contrast" strokeWidth={2.25} />
            )}
          </div>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            {editandoId ? "Editando gasto" : "Novo gasto"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-end">
          <div className="flex-1 sm:min-w-40">
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Descrição
            </label>
            <input
              name="descricao"
              autoComplete="off"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Conta de luz…"
              className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex gap-4">
            <div className="sm:w-52">
              <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaGasto)}
                className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
              >
                {CATEGORIAS_GASTO.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="sm:w-32">
              <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-gradient hover:opacity-90 transition-opacity text-gold-contrast font-heading font-semibold px-5 py-3 sm:py-2.5 rounded-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            {editandoId ? <Pencil size={18} /> : <Plus size={18} />}
            {editandoId ? "Salvar alterações" : "Adicionar gasto"}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicao}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-text-muted hover:text-text text-sm font-heading py-3 sm:py-2 px-3 rounded-md"
            >
              <X size={16} />
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="bg-surface border border-border border-t-2 border-t-gold rounded-sm">
        <div className="flex items-center gap-2 px-4 md:px-6 py-4">
          <Receipt size={15} className="text-olive" strokeWidth={2} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            {gastos.length} {gastos.length === 1 ? "gasto lançado" : "gastos lançados"}
          </span>
        </div>

        <div className="border-t border-dashed border-gold/25" />

        <ul>
          {gastos.map((gasto, idx) => (
            <li key={gasto.id} className="group relative">
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-out" />
              <div className="flex items-center gap-3 px-4 md:px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{gasto.descricao}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-text-muted bg-surface-alt rounded px-1.5 py-0.5 whitespace-nowrap">
                      {gasto.categoria}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {formatarDataHora(gasto.criadoEm)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm text-paprika/90">{formatarMoeda(gasto.valor)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => iniciarEdicao(gasto)}
                      aria-label={`Editar ${gasto.descricao}`}
                      className="p-3 -m-1 rounded-full text-text-muted hover:text-gold hover:bg-gold/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remover(gasto)}
                      aria-label={`Remover ${gasto.descricao}`}
                      className="p-3 -m-1 rounded-full text-text-muted hover:text-paprika hover:bg-paprika/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              {idx < gastos.length - 1 && (
                <div className="border-t border-dashed border-gold/25 mx-4 md:mx-6" />
              )}
            </li>
          ))}

          {gastos.length === 0 && (
            <li className="px-6 py-12 text-center text-text-muted">
              <Receipt size={24} className="mx-auto mb-2" />
              Nenhum gasto lançado ainda
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}