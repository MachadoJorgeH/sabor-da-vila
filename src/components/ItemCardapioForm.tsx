import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, ImagePlus, Trash2, UtensilsCrossed } from "lucide-react";
import { CATEGORIAS_CARDAPIO } from "../types/cardapio";
import type { ItemCardapio, CategoriaCardapio, FotoAcao } from "../types/cardapio";

const TAMANHO_MAX = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

interface ItemCardapioFormProps {
  inicial?: ItemCardapio;
  salvando: boolean;
  onSubmit: (dados: Omit<ItemCardapio, "id">, foto: FotoAcao) => void | Promise<void>;
}

export default function ItemCardapioForm({ inicial, salvando, onSubmit }: ItemCardapioFormProps) {
  const editando = inicial !== undefined;
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [preco, setPreco] = useState(inicial ? String(inicial.preco) : "");
  const [categoria, setCategoria] = useState<CategoriaCardapio>(
    inicial?.categoria ?? CATEGORIAS_CARDAPIO[0],
  );

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removida, setRemovida] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const fotoAtual = inicial?.foto;
  const imagemMostrada = preview ?? (removida ? null : fotoAtual ?? null);

  function handleEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!TIPOS_ACEITOS.includes(file.type)) {
      setErroFoto("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > TAMANHO_MAX) {
      setErroFoto("Imagem muito grande (máximo 5 MB).");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setArquivo(file);
    setPreview(URL.createObjectURL(file));
    setRemovida(false);
    setErroFoto(null);
  }

  function handleRemoverFoto() {
    if (preview) URL.revokeObjectURL(preview);
    setArquivo(null);
    setPreview(null);
    setErroFoto(null);
    if (fotoAtual) setRemovida(true);
  }

  function resolverFotoAcao(): FotoAcao {
    if (arquivo) return { tipo: "nova", arquivo };
    if (removida && fotoAtual) return { tipo: "remover" };
    return { tipo: "manter" };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !preco) return;

    await onSubmit({ nome, preco: Number(preco), categoria }, resolverFotoAcao());

    if (!editando) {
      setNome("");
      setPreco("");
      setCategoria(CATEGORIAS_CARDAPIO[0]);
      if (preview) URL.revokeObjectURL(preview);
      setArquivo(null);
      setPreview(null);
      setRemovida(false);
      setErroFoto(null);
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

      <div>
        <span className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
          Foto
        </span>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-md border border-border bg-surface-alt overflow-hidden flex items-center justify-center shrink-0">
            {imagemMostrada ? (
              <img src={imagemMostrada} alt="Prévia do item" className="w-full h-full object-cover" />
            ) : (
              <UtensilsCrossed size={22} className="text-text-muted" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={inputFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleEscolherArquivo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputFileRef.current?.click()}
              className="inline-flex items-center gap-2 border border-border rounded-md px-3 py-2 text-sm text-text hover:bg-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ImagePlus size={16} />
              {imagemMostrada ? "Trocar foto" : "Adicionar foto"}
            </button>
            {imagemMostrada && (
              <button
                type="button"
                onClick={handleRemoverFoto}
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-paprika transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika rounded-md px-1"
              >
                <Trash2 size={15} />
                Remover foto
              </button>
            )}
          </div>
        </div>
        {erroFoto && <p className="mt-2 text-sm text-paprika">{erroFoto}</p>}
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
