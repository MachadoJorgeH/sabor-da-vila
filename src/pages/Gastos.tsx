import { useState } from "react";
import { Plus, Pencil, Trash2, Receipt } from "lucide-react";
import { useGastos } from "../hooks/useGastos";
import type { Gasto } from "../types/gasto";
import { formatarDataHoraISO } from "../utils/formatDate";
import { formatarMoeda } from "../utils/formatCurrency";
import Modal from "../components/Modal";
import GastoForm from "../components/GastoForm";

export default function Gastos() {
  const { gastos, salvando, adicionar, atualizar, remover } = useGastos();
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);
  const [gastoExcluindo, setGastoExcluindo] = useState<Gasto | null>(null);

  async function handleSalvarEdicao(dados: Omit<Gasto, "id" | "criadoEm">) {
    if (!gastoEditando?.id) return;
    await atualizar(gastoEditando.id, dados);
    setGastoEditando(null);
  }

  async function handleConfirmarExclusao() {
    if (!gastoExcluindo) return;
    await remover(gastoExcluindo);
    setGastoExcluindo(null);
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

      <div className="bg-card-soft rounded-lg shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
            <Plus size={16} className="text-gold-contrast" strokeWidth={2.25} />
          </div>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            Novo gasto
          </span>
        </div>

        <GastoForm salvando={salvando} onSubmit={adicionar} />
      </div>

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
                      {formatarDataHoraISO(gasto.criadoEm)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm text-paprika/90">{formatarMoeda(gasto.valor)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setGastoEditando(gasto)}
                      aria-label={`Editar ${gasto.descricao}`}
                      className="p-3 -m-1 rounded-full text-text-muted hover:text-gold hover:bg-gold/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setGastoExcluindo(gasto)}
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

      <Modal
        aberto={gastoEditando !== null}
        onFechar={() => setGastoEditando(null)}
        titulo="Editar gasto"
      >
        {gastoEditando && (
          <GastoForm
            inicial={gastoEditando}
            salvando={salvando}
            onSubmit={handleSalvarEdicao}
          />
        )}
      </Modal>

      <Modal
        aberto={gastoExcluindo !== null}
        onFechar={() => setGastoExcluindo(null)}
        titulo="Remover gasto"
      >
        <p className="text-sm text-text">
          Remover o gasto <span className="font-semibold">{gastoExcluindo?.descricao}</span>?
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={() => setGastoExcluindo(null)}
            className="px-4 py-2 rounded-md text-sm font-heading text-text-muted hover:text-text hover:bg-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmarExclusao}
            disabled={salvando}
            className="px-4 py-2 rounded-md text-sm font-heading font-semibold text-white bg-paprika hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
          >
            Remover
          </button>
        </div>
      </Modal>
    </div>
  );
}
