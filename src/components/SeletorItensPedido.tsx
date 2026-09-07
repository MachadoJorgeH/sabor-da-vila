import { useState } from "react";
import { Search, UtensilsCrossed } from "lucide-react";
import { CATEGORIAS_CARDAPIO } from "../types/cardapio";
import type { ItemCardapio, CategoriaCardapio } from "../types/cardapio";
import { formatarMoeda } from "../utils/formatCurrency";
import { normalizar } from "../utils/texto";

interface SeletorItensPedidoProps {
  itens: ItemCardapio[];
  quantidades: Record<string, number>;
  onAdicionar: (item: ItemCardapio) => void;
}

export default function SeletorItensPedido({
  itens,
  quantidades,
  onAdicionar,
}: SeletorItensPedidoProps) {
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaCardapio | "todos">("todos");

  const termo = normalizar(busca);
  const filtrados = itens.filter((item) => {
    if (categoriaFiltro !== "todos" && item.categoria !== categoriaFiltro) return false;
    if (termo && !normalizar(item.nome).includes(termo)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar item…"
          className="w-full border border-border rounded-md pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategoriaFiltro("todos")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-heading font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            categoriaFiltro === "todos"
              ? "border-gold text-gold bg-gold/5"
              : "border-border text-text-muted hover:text-text"
          }`}
        >
          Todos
        </button>
        {CATEGORIAS_CARDAPIO.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoriaFiltro(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-heading font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              categoriaFiltro === cat
                ? "border-gold text-gold bg-gold/5"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {CATEGORIAS_CARDAPIO.map((categoria) => {
        const doCategoria = filtrados.filter((item) => item.categoria === categoria);
        if (doCategoria.length === 0) return null;

        return (
          <div key={categoria}>
            <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-2">
              {categoria}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {doCategoria.map((item) => {
                const qtd = item.id ? quantidades[item.id] ?? 0 : 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onAdicionar(item)}
                    className={`relative flex flex-col text-left border rounded-md overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                      qtd > 0 ? "border-gold" : "border-border hover:border-gold/50"
                    }`}
                  >
                    <div className="aspect-square bg-surface-alt flex items-center justify-center overflow-hidden">
                      {item.foto ? (
                        <img src={item.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UtensilsCrossed size={22} className="text-text-muted/40" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-text leading-tight line-clamp-2">
                        {item.nome}
                      </p>
                      <span className="font-mono text-[11px] text-gold">
                        {formatarMoeda(item.preco)}
                      </span>
                    </div>
                    {qtd > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gold text-gold-contrast text-[11px] font-mono font-bold flex items-center justify-center">
                        {qtd}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtrados.length === 0 && (
        <p className="text-center text-sm text-text-muted py-6">Nenhum item encontrado</p>
      )}
    </div>
  );
}
