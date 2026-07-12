import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Maximize, ArrowLeft, ChefHat, StickyNote, Sun, Moon } from "lucide-react";
import { usePedidos } from "../hooks/usePedidos";
import { useTheme } from "../hooks/useTheme";
import type { Pedido, StatusPedido } from "../types/pedido";

const COLUNAS: { status: StatusPedido; titulo: string; acao: string | null }[] = [
  { status: "recebido", titulo: "Recebido", acao: "Iniciar preparo" },
  { status: "em_preparo", titulo: "Em preparo", acao: "Marcar pronto" },
  { status: "pronto", titulo: "Pronto", acao: null },
];

const MIN_AVISO = 8;
const MIN_URGENTE = 15;

function formatarTempo(ms: number): string {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSegundos / 60);
  const seg = totalSegundos % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

function Ticket({ pedido, agora, acao, onAvancar }: {
  pedido: Pedido;
  agora: Date;
  acao: string | null;
  onAvancar: () => void;
}) {
  const decorrido = pedido.criadoEm ? agora.getTime() - pedido.criadoEm.toDate().getTime() : 0;
  const minutos = decorrido / 60000;
  const urgente = minutos >= MIN_URGENTE;
  const aviso = minutos >= MIN_AVISO && !urgente;

  return (
    <div
      className={`bg-surface rounded-md p-4 border-2 transition-colors ${
        urgente
          ? "border-paprika motion-safe:animate-pulse"
          : aviso
            ? "border-gold"
            : "border-gold/30"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-heading font-bold text-2xl text-text">{pedido.mesa}</span>
        <span
          className={`flex items-center gap-1.5 font-mono text-lg font-semibold tabular-nums ${
            urgente ? "text-paprika" : aviso ? "text-gold" : "text-text-muted"
          }`}
        >
          {urgente && <Flame size={18} />}
          {formatarTempo(decorrido)}
        </span>
      </div>

      <ul className="text-text text-lg space-y-1 mb-2">
        {pedido.itens.map((item, i) => (
          <li key={i}>
            <span className="font-mono font-semibold">{item.quantidade}x</span> {item.nome}
          </li>
        ))}
      </ul>

      {pedido.observacao && (
        <div className="flex items-start gap-2 bg-paprika/10 border-2 border-paprika/40 rounded-md px-3 py-2 mb-2">
          <StickyNote size={18} className="text-paprika shrink-0 mt-0.5" />
          <p className="text-base font-semibold text-paprika leading-snug">{pedido.observacao}</p>
        </div>
      )}

      {acao && (
        <button
          onClick={onAvancar}
          className="w-full bg-gold-gradient hover:opacity-90 transition-opacity text-gold-contrast font-heading font-bold text-lg py-3.5 rounded-md focus:outline-none focus-visible:ring-4 focus-visible:ring-gold"
        >
          {acao}
        </button>
      )}

      {!acao && (
        <p className="text-center font-mono text-sm uppercase tracking-widest text-olive font-semibold py-1">
          Aguardando retirada
        </p>
      )}
    </div>
  );
}

export default function Cozinha() {
  const { pedidos, avancarStatus } = usePedidos();
  const { tema, alternar } = useTheme();
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  function pedirTelaCheia() {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const ativos = pedidos.filter((p) => p.status !== "entregue").length;

  return (
    <div className="h-screen flex flex-col bg-page-gradient overflow-hidden">
      <header className="h-16 shrink-0 bg-card-soft border-b border-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/pedidos"
            aria-label="Voltar para Pedidos"
            className="text-text-muted hover:text-text p-2 -ml-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowLeft size={20} />
          </Link>
          <ChefHat size={22} className="text-gold" />
          <h1 className="font-heading font-bold text-text text-lg md:text-xl">Cozinha</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-text-muted uppercase tracking-widest hidden sm:inline">
            {ativos} ativos
          </span>
          <span className="font-mono text-xl font-semibold text-text tabular-nums">
            {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={alternar}
            aria-label="Alternar tema"
            className="p-2 rounded-full hover:bg-surface-alt transition-colors text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {tema === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={pedirTelaCheia}
            aria-label="Tela cheia"
            className="p-2 rounded-full hover:bg-surface-alt transition-colors text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <Maximize size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 md:p-4">
        {COLUNAS.map(({ status, titulo, acao }) => {
          const pedidosDoStatus = pedidos.filter((p) => p.status === status);

          return (
            <div key={status} className="flex flex-col min-h-0 bg-card-soft rounded-lg p-3">
              <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b-2 border-gold/30 shrink-0">
                <span className="font-heading font-bold text-lg text-text uppercase tracking-wide">
                  {titulo}
                </span>
                <span className="font-mono text-lg font-bold text-gold">{pedidosDoStatus.length}</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 px-1">
                {pedidosDoStatus.map((pedido) => (
                  <Ticket
                    key={pedido.id}
                    pedido={pedido}
                    agora={agora}
                    acao={acao}
                    onAvancar={() => avancarStatus(pedido)}
                  />
                ))}

                {pedidosDoStatus.length === 0 && (
                  <p className="text-center text-text-muted text-base py-8">Nada por aqui</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
