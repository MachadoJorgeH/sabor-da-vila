import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { CATEGORIAS_GASTO } from "../types/gasto";
import type { Gasto, CategoriaGasto } from "../types/gasto";

interface GastoFormProps {
  inicial?: Gasto;
  salvando: boolean;
  onSubmit: (dados: Omit<Gasto, "id" | "criadoEm">) => void | Promise<void>;
}

export default function GastoForm({ inicial, salvando, onSubmit }: GastoFormProps) {
  const editando = inicial !== undefined;
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [valor, setValor] = useState(inicial ? String(inicial.valor) : "");
  const [categoria, setCategoria] = useState<CategoriaGasto>(
    inicial?.categoria ?? CATEGORIAS_GASTO[0],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao || !valor) return;
    await onSubmit({ descricao, valor: Number(valor), categoria });
    if (!editando) {
      setDescricao("");
      setValor("");
      setCategoria(CATEGORIAS_GASTO[0]);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <button
        type="submit"
        disabled={salvando}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-gradient hover:opacity-90 transition-opacity text-gold-contrast font-heading font-semibold px-5 py-3 sm:py-2.5 rounded-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        {editando ? <Pencil size={18} /> : <Plus size={18} />}
        {editando ? "Salvar alterações" : "Adicionar gasto"}
      </button>
    </form>
  );
}
