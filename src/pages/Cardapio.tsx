import { useState } from "react";
import { Plus, Pencil, Trash2, UtensilsCrossed, X } from "lucide-react";
import { useCardapio } from "../hooks/useCardapio";
import { CATEGORIAS_CARDAPIO } from "../types/cardapio";
import type { ItemCardapio, CategoriaCardapio } from "../types/cardapio";
import { formatarMoeda } from "../utils/formatCurrency";

export default function Cardapio() {
  const { itens, salvando, adicionar, atualizar, remover } = useCardapio();

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState<CategoriaCardapio>(CATEGORIAS_CARDAPIO[0]);

  function iniciarEdicao(item: ItemCardapio) {
    setEditandoId(item.id ?? null);
    setNome(item.nome);
    setPreco(String(item.preco));
    setCategoria(item.categoria);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setNome("");
    setPreco("");
    setCategoria(CATEGORIAS_CARDAPIO[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !preco) return;

    const dados = { nome, preco: Number(preco), categoria };

    if (editandoId) {
      await atualizar(editandoId, dados);
    } else {
      await adicionar(dados);
    }

    cancelarEdicao();
  }

  const precoMedio = itens.length
    ? itens.reduce((soma, item) => soma + item.preco, 0) / itens.length
    : 0;

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
            Cardápio
          </span>
          <h1 className="font-heading font-semibold text-text text-xl md:text-2xl leading-tight">
            Itens do menu
          </h1>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
            Preço médio
          </span>
          <span className="font-mono text-base md:text-lg font-semibold text-gold">
            {formatarMoeda(precoMedio)}
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
            {editandoId ? "Editando item" : "Novo item"}
          </span>
        </div>

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

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-gradient hover:opacity-90 transition-opacity text-gold-contrast font-heading font-semibold px-5 py-3 sm:py-2.5 rounded-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            {editandoId ? <Pencil size={18} /> : <Plus size={18} />}
            {editandoId ? "Salvar alterações" : "Adicionar ao cardápio"}
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
          <UtensilsCrossed size={15} className="text-olive" strokeWidth={2} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            {itens.length} {itens.length === 1 ? "item" : "itens"} no cardápio
          </span>
        </div>

        <div className="border-t border-dashed border-gold/25" />

        <ul>
          {itens.map((item, idx) => (
            <li key={item.id} className="group relative">
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-out" />
              <div className="flex items-center gap-3 px-4 md:px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{item.nome}</p>
                  <span className="inline-block mt-1 font-mono text-[10px] tracking-widest uppercase text-text-muted bg-surface-alt rounded px-1.5 py-0.5">
                    {item.categoria}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm text-text">{formatarMoeda(item.preco)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => iniciarEdicao(item)}
                      aria-label={`Editar ${item.nome}`}
                      className="p-3 -m-1 rounded-full text-text-muted hover:text-gold hover:bg-gold/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remover(item)}
                      aria-label={`Remover ${item.nome}`}
                      className="p-3 -m-1 rounded-full text-text-muted hover:text-paprika hover:bg-paprika/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              {idx < itens.length - 1 && (
                <div className="border-t border-dashed border-gold/25 mx-4 md:mx-6" />
              )}
            </li>
          ))}

          {itens.length === 0 && (
            <li className="px-6 py-12 text-center text-text-muted">
              <UtensilsCrossed size={24} className="mx-auto mb-2" />
              Nenhum item cadastrado ainda
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}