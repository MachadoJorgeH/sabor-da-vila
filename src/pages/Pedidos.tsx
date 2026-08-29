import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, X, ArrowRight, Trash2, ClipboardList, Store, Bike, History, StickyNote, ChefHat } from "lucide-react";
import { usePedidos } from "../hooks/usePedidos";
import { useCardapio } from "../hooks/useCardapio";
import { ItemCardapioSelect } from "../components/ItemCardapioSelect";
import { LABEL_STATUS, LABEL_ORIGEM, totalPedido } from "../types/pedido";
import type { ItemPedido, Pedido, StatusPedido, OrigemPedido } from "../types/pedido";
import { formatarHora } from "../utils/formatDate";
import { formatarMoeda } from "../utils/formatCurrency";

const COLUNAS: StatusPedido[] = ["recebido", "em_preparo", "pronto", "entregue"];
const MAX_ENTREGUES_VISIVEIS = 12;

export default function Pedidos() {
  const { pedidos, salvando, criar, avancarStatus, remover } = usePedidos();
  const { itens: cardapio } = useCardapio();

  const [mesa, setMesa] = useState("");
  const [origem, setOrigem] = useState<OrigemPedido>("salao");
  const [observacao, setObservacao] = useState("");
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [cardapioIdSelecionado, setCardapioIdSelecionado] = useState("");
  const [itemQtd, setItemQtd] = useState("1");

  const [searchParams, setSearchParams] = useSearchParams();
  const abaParam = searchParams.get("status");
  const abaMobile: StatusPedido = COLUNAS.includes(abaParam as StatusPedido)
    ? (abaParam as StatusPedido)
    : "recebido";

  function setAbaMobile(status: StatusPedido) {
    setSearchParams(status === "recebido" ? {} : { status });
  }

  function adicionarItemNaLista() {
    const itemCardapio = cardapio.find((c) => c.id === cardapioIdSelecionado);
    if (!itemCardapio || !itemCardapio.id) return;

    setItens([
      ...itens,
      {
        cardapioId: itemCardapio.id,
        nome: itemCardapio.nome,
        precoUnitario: itemCardapio.preco,
        quantidade: Number(itemQtd) || 1,
      },
    ]);
    setCardapioIdSelecionado("");
    setItemQtd("1");
  }

  function removerItemDaLista(index: number) {
    setItens(itens.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mesa || itens.length === 0) return;

    await criar(mesa, itens, origem, observacao);
    setMesa("");
    setOrigem("salao");
    setObservacao("");
    setItens([]);
  }

  function renderColuna(status: StatusPedido) {
    const pedidosDoStatus = pedidos.filter((p) => p.status === status);
    const exibidos =
      status === "entregue"
        ? pedidosDoStatus.slice(-MAX_ENTREGUES_VISIVEIS)
        : pedidosDoStatus;
    const ocultos = pedidosDoStatus.length - exibidos.length;

    return (
      <div key={status} className="border border-border rounded-sm p-4">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-dashed border-gold/40">
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
            {LABEL_STATUS[status]}
          </span>
          <span className="font-mono text-[11px] text-text-muted">{pedidosDoStatus.length}</span>
        </div>

        <div className="space-y-6">
          {exibidos.map((pedido: Pedido, idx) => (
            <div
              key={pedido.id}
              style={{ animationDelay: `${Math.min(idx, 5) * 40}ms` }}
              className="relative bg-surface border border-border rounded-sm p-3.5 pt-5 text-sm motion-safe:animate-[ticket-fade-in_0.35s_ease-out_backwards]"
            >
              <span className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-surface-alt border border-border" />

              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-[11px] tracking-widest uppercase text-text-muted">
                    {pedido.mesa}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-mono text-[9px] tracking-wide uppercase mt-0.5 ${
                      (pedido.origem ?? "salao") === "app" ? "text-olive" : "text-text-muted/70"
                    }`}
                  >
                    {(pedido.origem ?? "salao") === "app" ? <Bike size={10} /> : <Store size={10} />}
                    {LABEL_ORIGEM[pedido.origem ?? "salao"]}
                  </span>
                </div>
                <button
                  onClick={() => remover(pedido)}
                  aria-label={`Remover pedido de ${pedido.mesa}`}
                  className="p-2.5 -m-2.5 rounded-full text-text-muted hover:text-paprika hover:bg-paprika/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {status === "entregue" && (
                <span className="stamp text-[10px] text-olive mb-2">Entregue</span>
              )}

              <ul className="text-text-muted text-xs space-y-0.5">
                {pedido.itens.map((item, i) => (
                  <li key={i}>{item.quantidade}x {item.nome}</li>
                ))}
              </ul>

              {pedido.observacao && (
                <div className="flex items-start gap-1.5 bg-paprika/5 border border-paprika/20 rounded-md px-2.5 py-2 mt-2.5">
                  <StickyNote size={12} className="text-paprika shrink-0 mt-0.5" />
                  <p className="text-xs text-paprika/90 leading-snug">{pedido.observacao}</p>
                </div>
              )}

              <div className="border-t border-dashed border-gold/25 mt-2.5 pt-2.5 flex justify-between items-center">
                <span className="font-mono text-xs font-semibold text-gold">
                  {formatarMoeda(totalPedido(pedido))}
                </span>
                <span className="font-mono text-[10px] text-text-muted">{formatarHora(pedido.criadoEm)}</span>
              </div>

              {status !== "entregue" && (
                <button
                  onClick={() => avancarStatus(pedido)}
                  className="w-full flex items-center justify-center gap-1.5 border border-gold text-gold hover:bg-gold-gradient hover:text-gold-contrast hover:border-transparent text-xs font-heading font-semibold mt-3 py-2.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Avançar <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}

          {pedidosDoStatus.length === 0 && (
            <p className="text-xs text-text-muted text-center py-4">
              <ClipboardList size={16} className="mx-auto mb-1" />
              Vazio
            </p>
          )}

          {ocultos > 0 && (
            <Link
              to="/historico"
              className="flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-gold transition-colors py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
            >
              <History size={12} />
              +{ocultos} entregues hoje · Ver histórico
            </Link>
          )}
        </div>
      </div>
    );
  }

  const pedidosAtivos = pedidos.filter((p) => p.status !== "entregue").length;

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
            Cozinha
          </span>
          <h1 className="font-heading font-semibold text-text text-xl md:text-2xl leading-tight">
            Pedidos
          </h1>
        </div>
        <Link
          to="/cozinha"
          target="_blank"
          rel="noopener"
          className="hidden sm:flex items-center gap-2 text-sm font-heading font-semibold text-text-muted hover:text-gold border border-border hover:border-gold px-3 py-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <ChefHat size={16} />
          Modo cozinha
        </Link>
        <div className="text-right shrink-0">
          <span className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
            Em andamento
          </span>
          <span className="font-mono text-base md:text-lg font-semibold text-olive">
            {pedidosAtivos}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card-soft rounded-lg shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
            <Plus size={16} className="text-gold-contrast" strokeWidth={2.25} />
          </div>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            Novo pedido
          </span>
        </div>

        <div>
          <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
            Origem
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrigem("salao")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-md text-sm font-heading font-semibold border transition-colors ${
                origem === "salao"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-border text-text-muted hover:text-text"
              }`}
            >
              <Store size={15} /> Salão
            </button>
            <button
              type="button"
              onClick={() => setOrigem("app")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-md text-sm font-heading font-semibold border transition-colors ${
                origem === "app"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-border text-text-muted hover:text-text"
              }`}
            >
              <Bike size={15} /> App / Delivery
            </button>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
            {origem === "app" ? "Código do pedido" : "Mesa / Comanda"}
          </label>
          <input
            name="mesa"
            autoComplete="off"
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            placeholder={origem === "app" ? "Ex: iFood #4521…" : "Ex: Mesa 5…"}
            className="w-full sm:w-48 border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1 sm:min-w-48">
            <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
              Item do cardápio
            </label>
            <ItemCardapioSelect
              itens={cardapio}
              value={cardapioIdSelecionado}
              onChange={setCardapioIdSelecionado}
            />
          </div>

          <div className="flex gap-3">
            <div className="w-20">
              <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
                Qtd
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={itemQtd}
                onChange={(e) => setItemQtd(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
              />
            </div>

            <button
              type="button"
              onClick={adicionarItemNaLista}
              disabled={!cardapioIdSelecionado}
              className="self-end flex items-center gap-2 bg-gold-gradient text-gold-contrast hover:bg-gold-light font-heading text-sm px-4 py-3 sm:py-2 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Plus size={16} />
              Item
            </button>
          </div>
        </div>

        {itens.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {itens.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 bg-surface-alt rounded-md pl-3 pr-1.5 py-1.5 text-sm text-text"
              >
                <span className="font-mono text-xs">
                  {item.quantidade}x {item.nome} — {formatarMoeda(item.precoUnitario * item.quantidade)}
                </span>
                <button
                  type="button"
                  onClick={() => removerItemDaLista(index)}
                  aria-label={`Remover ${item.nome} do pedido`}
                  className="p-2 rounded-full text-text-muted hover:text-paprika hover:bg-paprika/10 transition-colors"
                >
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div>
          <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
            Observações
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: Sem alface, sem cebola…"
            rows={2}
            className="w-full border border-border rounded-md px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={salvando || itens.length === 0 || !mesa}
          className="w-full sm:w-auto bg-gold-gradient hover:opacity-90 transition-opacity text-gold-contrast font-heading font-semibold px-5 py-3 sm:py-2.5 rounded-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          Enviar pedido pra cozinha
        </button>
      </form>

      {/* Abas — só no mobile */}
      <div className="md:hidden flex gap-1 border-b border-border overflow-x-auto">
        {COLUNAS.map((status) => {
          const count = pedidos.filter((p) => p.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setAbaMobile(status)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-heading font-semibold border-b-2 transition-colors ${
                abaMobile === status
                  ? "border-gold text-gold"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              {LABEL_STATUS[status]}
              <span className="font-mono text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: só a coluna da aba selecionada */}
      <div className="md:hidden">
        {renderColuna(abaMobile)}
      </div>

      {/* Desktop: as 4 colunas juntas */}
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {COLUNAS.map((status) => renderColuna(status))}
      </div>
    </div>
  );
}