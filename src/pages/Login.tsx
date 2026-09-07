import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChefHat, Lock } from "lucide-react";
import { useAuth } from "../context/useAuth";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEntrando(true);

    try {
      await entrar(email, senha);
      navigate("/estoque");
    } catch {
      setErro("E-mail ou senha incorretos.");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-page-gradient">
      {/* Painel de boas-vindas — visível a partir de telas médias */}
      <div className="hidden md:flex md:w-[42%] lg:w-[38%] flex-col justify-between bg-gold-gradient-diagonal text-gold-contrast p-10 lg:p-12 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
          <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-gold-contrast/70">
            Sabor da Vila
          </span>
        </div>

        <div>
          <p className="font-heading text-4xl lg:text-5xl font-semibold leading-[1.05] tracking-tight text-balance mb-4">
            Bem-vindo
            <br />
            de volta.
          </p>
          <p className="font-body text-sm text-gold-contrast/80 max-w-xs">
            Café da manhã, almoço e pizzas — o painel que mantém a vila
            funcionando.
          </p>
        </div>

        <div className="h-6 -mx-10 lg:-mx-12 -mb-10 lg:-mb-12 bg-awning-stripes" />
      </div>

      {/* Comanda de acesso */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-10">
        <form
          onSubmit={handleSubmit}
          className="motion-safe:animate-[ticket-in_0.5s_ease-out] bg-card-soft ticket-edge-top rounded-lg shadow-sm w-full max-w-sm"
        >
          <div className="flex flex-col items-center pt-8 px-6 md:px-8">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Sabor Da Vila" width={48} height={48} className="w-12 h-12 object-contain" />
              <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center shadow-sm">
                <ChefHat
                  className="text-gold-contrast"
                  size={20}
                  strokeWidth={1.75}
                />
              </div>
            </div>
            <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-text-muted">
              Comanda Nº 001
            </span>
            <h1 className="font-heading font-semibold text-text text-lg mt-1">
              Control Center
            </h1>
          </div>

          <div className="border-t border-dashed border-gold/25 mx-6 md:mx-8 mt-6" />

          <div className="px-6 md:px-8 pt-6 space-y-5">
            <div>
              <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5">
                Senha
              </label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text"
              />
            </div>

            {erro && (
              <p role="alert" aria-live="polite" className="text-sm text-paprika">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={entrando}
              className="w-full bg-gold-gradient hover:opacity-90 transition-opacity text-gold-contrast font-heading font-semibold py-2.5 md:py-2 rounded-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              {entrando ? "Entrando…" : "Entrar"}
            </button>
          </div>

          <div className="border-t border-dashed border-gold/25 mx-6 md:mx-8 mt-6" />

          <div className="flex items-center justify-center gap-1.5 py-5">
            <Lock size={12} className="text-olive" strokeWidth={2} />
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-muted">
              Acesso restrito · Equipe
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
