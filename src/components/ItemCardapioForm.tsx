import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { CATEGORIAS_CARDAPIO } from "../types/cardapio";
import type { ItemCardapio, CategoriaCardapio } from "../types/cardapio";

interface ItemCardapioFormProps {
  inicial?: ItemCardapio;
  salvando: boolean;
  onSubmit: (dados: Omit<ItemCardapio, "id">) => void | Promise<void>;
}

export default function ItemCardapioForm({ inicial, salvando, onSubmit }: ItemCardapioFormProps) {
  const editando = inicial !== undefined;
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [preco, setPreco] = useState(inicial ? String(inicial.preco) : "");
  const [categoria, setCategoria] = useState<CategoriaCardapio>(
    inicial?.categoria ?? CATEGORIAS_CARDAPIO[0],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !preco) return;
    await onSubmit({ nome, preco: Number(preco), categoria });
    if (!editando) {
      setNome("");
      setPreco("");
      setCategoria(CATEGORIAS_CARDAPIO[0]);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-end">
        <div className="flex-1 sm:min-w-40">
          <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
            Item
          </label>
          <input
            name="item"
            autoComplete="off"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: X-Salada…"
            className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-4">
          <div className="sm:w-44">
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaCardapio)}
              className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
            >
              {CATEGORIAS_CARDAPIO.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="sm:w-32">
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Preço (R$)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
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
        {editando ? "Salvar alterações" : "Adicionar ao cardápio"}
      </button>
    </form>
  );
}