import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Package,
  ClipboardList,
  TrendingUp,
  UtensilsCrossed,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  History,
  ScrollText,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import logo from "../assets/logo.png";
import { useAuth } from "../context/useAuth";

const navItems = [
  { to: "/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { to: "/estoque", label: "Estoque", icon: Package },
  { to: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/financeiro", label: "Financeiro", icon: TrendingUp },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/logs", label: "Logs", icon: ScrollText },
];

export default function Layout() {
  const { tema, alternar } = useTheme();
  const navigate = useNavigate();
  const { sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [colapsada, setColapsada] = useState(
    () => localStorage.getItem("sidebarColapsada") === "1"
  );

  useEffect(() => {
    localStorage.setItem("sidebarColapsada", colapsada ? "1" : "0");
  }, [colapsada]);

  function handleSair() {
  sair();
  navigate("/");
  }

  return (
    <div className="flex h-screen bg-page-gradient">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-gold-gradient focus:text-gold-contrast focus:px-4 focus:py-2 focus:rounded-md focus:font-heading focus:font-semibold"
      >
        Pular para o conteúdo principal
      </a>

      {menuAberto && (
        <button
          type="button"
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu"
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 ${
          colapsada ? "md:w-20" : "md:w-64"
        } bg-sidebar border-r border-gold/20 flex flex-col transition-[width,transform] duration-300 ease-in-out ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between md:justify-center py-6 px-4">
          <img
            src={logo}
            alt="Sabor Da Vila"
            width={128}
            height={40}
            className={`h-auto object-contain w-28 transition-[width] duration-300 ease-in-out ${
              colapsada ? "md:w-10" : "md:w-32"
            }`}
          />
          <button
            onClick={() => setMenuAberto(false)}
            className="md:hidden text-chalk rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuAberto(false)}
              title={label}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-md font-heading text-sm transition-colors ${
                  colapsada ? "md:justify-center md:px-0" : ""
                } ${
                  isActive
                    ? "text-chalk bg-white/5"
                    : "text-chalk/70 hover:text-chalk hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={1.75} className="shrink-0" />
                  <span className={colapsada ? "md:sr-only" : ""}>{label}</span>
                  <span
                    className={`absolute left-4 right-4 bottom-1.5 h-0.5 bg-gold origin-left transition-transform duration-200 ease-out ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    } ${colapsada ? "md:hidden" : ""}`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block px-3 pb-4">
          <button
            onClick={() => setColapsada((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-chalk/70 hover:text-chalk hover:bg-white/5 transition-colors text-sm font-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={colapsada ? "Expandir menu" : "Recolher menu"}
          >
            {colapsada ? <ChevronRight size={18} className="shrink-0" /> : <ChevronLeft size={18} className="shrink-0" />}
            <span className={colapsada ? "sr-only" : ""}>Recolher</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-1 bg-gold-gradient" />

        <header className="h-14 md:h-16 bg-card-soft border-b border-border flex items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button
              onClick={() => setMenuAberto(true)}
              className="md:hidden text-text-muted shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-heading font-semibold text-text text-sm md:text-base truncate">
              Sabor Da Vila
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={alternar}
              className="p-2 rounded-full hover:bg-surface-alt transition-colors text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Alternar tema"
            >
              {tema === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={handleSair}
              className="p-2 rounded-full hover:bg-surface-alt transition-colors text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main id="conteudo-principal" className="flex-1 overflow-y-auto p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}