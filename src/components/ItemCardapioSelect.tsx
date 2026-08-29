import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { CATEGORIAS_CARDAPIO } from "../types/cardapio";
import type { ItemCardapio } from "../types/cardapio";
import { formatarMoeda } from "../utils/formatCurrency";

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

interface Props {
  itens: ItemCardapio[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function ItemCardapioSelect({
  itens,
  value,
  onChange,
  placeholder = "Selecione…",
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);

  const selecionado = itens.find((item) => item.id === value);

  useEffect(() => {
    if (!aberto) return;
    function onClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", onClickFora);
    return () => document.removeEventListener("mousedown", onClickFora);
  }, [aberto]);

  useEffect(() => {
    if (aberto) buscaRef.current?.focus();
    else setBusca("");
  }, [aberto]);

  const grupos = useMemo(() => {
    const termo = normalizar(busca.trim());
    const filtrados = termo
      ? itens.filter((item) => normalizar(item.nome).includes(termo))
      : itens;

    const categoriasConhecidas = new Set<string>(CATEGORIAS_CARDAPIO);
    const ordem: string[] = [...CATEGORIAS_CARDAPIO];
    if (filtrados.some((item) => !categoriasConhecidas.has(item.categoria))) {
      ordem.push("Outros");
    }

    return ordem
      .map((categoria) => ({
        categoria,
        itens: filtrados.filter((item) =>
          categoria === "Outros"
            ? !categoriasConhecidas.has(item.categoria)
            : item.categoria === categoria
        ),
      }))
      .filter((grupo) => grupo.itens.length > 0);
  }, [itens, busca]);

  function selecionar(id: string) {
    onChange(id);
    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className="w-full flex items-center justify-between gap-2 border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-gold"
      >
        <span className={`truncate ${selecionado ? "" : "text-text-muted"}`}>
          {selecionado
            ? `${selecionado.nome} — ${formatarMoeda(selecionado.preco)}`
            : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-muted transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto && (
        <div className="absolute z-40 mt-1 w-full bg-surface border border-border rounded-md shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                ref={buscaRef}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setAberto(false);
                }}
                placeholder="Buscar item…"
                className="w-full border border-border rounded-md pl-8 pr-3 py-2 text-base sm:text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>

          <ul
            role="listbox"
            className="max-h-[50vh] sm:max-h-72 overflow-y-auto overscroll-contain py-1"
          >
            {grupos.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-text-muted">
                Nenhum item encontrado
              </li>
            )}

            {grupos.map((grupo) => (
              <li key={grupo.categoria}>
                <p className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest uppercase text-text-muted">
                  {grupo.categoria}
                </p>
                <ul>
                  {grupo.itens.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => selecionar(item.id!)}
                        role="option"
                        aria-selected={item.id === value}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-alt ${
                          item.id === value ? "bg-gold/10 text-gold" : "text-text"
                        }`}
                      >
                        <span className="truncate">{item.nome}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs text-text-muted">
                            {formatarMoeda(item.preco)}
                          </span>
                          {item.id === value && <Check size={14} className="text-gold" />}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
