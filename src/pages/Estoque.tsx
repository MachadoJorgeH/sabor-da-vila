import { useState } from "react";
import { Plus, Trash2, Package, Boxes } from "lucide-react";
import { useEstoque } from "../hooks/useEstoque";
import { formatarMoeda } from "../utils/formatCurrency";

export default function Estoque() {
  const { itens, salvando, adicionar, remover } = useEstoque();

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("un");
  const [custo, setCusto] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !quantidade || !custo) return;

    await adicionar({
      nome,
      quantidade: Number(quantidade),
      unidade,
      custo: Number(custo),
    });

    setNome("");
    setQuantidade("");
    setCusto("");
    setUnidade("un");
  }

  const totalInvestido = itens.reduce((soma, item) => soma + item.custo, 0);

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
            Despensa
          </span>
          <h1 className="font-heading font-semibold text-text text-xl md:text-2xl leading-tight">
            Estoque
          </h1>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
            Investido
          </span>
          <span className="font-mono text-base md:text-lg font-semibold text-olive">
            {formatarMoeda(totalInvestido)}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card-soft rounded-lg shadow-sm p-4 md:p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
            <Plus size={16} className="text-gold-contrast" strokeWidth={2.25} />
          </div>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            Repor item
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-end">
          <div className="flex-1 sm:min-w-40">
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Produto
            </label>
            <input
              name="produto"
              autoComplete="off"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Farinha de trigo…"
              className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex gap-4">
            <div className="sm:w-28">
              <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
                Quantidade
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
                className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
              />
            </div>

            <div className="sm:w-24">
              <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
                Unidade
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
              >
                <option value="un">un</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          <div className="sm:w-32">
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Gasto (R$)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="0,00"
              className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-gradient hover:opacity-90 transition-opacity text-gold-contrast font-heading font-semibold px-5 py-3 sm:py-2.5 rounded-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <Plus size={18} />
          Adicionar ao estoque
        </button>
      </form>

      <div className="bg-surface border border-border border-t-2 border-t-gold rounded-sm">
        <div className="flex items-center gap-2 px-4 md:px-6 py-4">
          <Boxes size={15} className="text-olive" strokeWidth={2} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            {itens.length} {itens.length === 1 ? "item" : "itens"} na despensa
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
                  <p className="font-mono text-xs text-text-muted mt-0.5">
                    {item.quantidade} {item.unidade} · {formatarMoeda(item.custo)}
                  </p>
                </div>
                <button
                  onClick={() => remover(item)}
                  aria-label={`Remover ${item.nome}`}
                  className="shrink-0 p-3 -m-3 rounded-full text-text-muted hover:text-paprika hover:bg-paprika/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              {idx < itens.length - 1 && (
                <div className="border-t border-dashed border-gold/25 mx-4 md:mx-6" />
              )}
            </li>
          ))}

          {itens.length === 0 && (
            <li className="px-6 py-12 text-center text-text-muted">
              <Package size={24} className="mx-auto mb-2" />
              Nenhum item no estoque ainda
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}