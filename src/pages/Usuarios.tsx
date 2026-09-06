import { useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useUsuarios } from "../hooks/useUsuarios";
import { useAuth } from "../context/useAuth";
import { LABEL_ROLE } from "../types/usuario";
import type { Usuario, RoleUsuario } from "../types/usuario";
import Modal from "../components/Modal";
import UsuarioForm from "../components/UsuarioForm";

export default function Usuarios() {
  const { usuarios, salvando, adicionar, atualizar, remover } = useUsuarios();
  const { usuario: usuarioAtual } = useAuth();
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioExcluindo, setUsuarioExcluindo] = useState<Usuario | null>(null);

  async function handleSalvarEdicao(dados: {
    email: string;
    senha: string;
    nome: string;
    role: RoleUsuario;
  }) {
    if (!usuarioEditando) return;
    await atualizar(usuarioEditando.id, {
      nome: dados.nome,
      role: dados.role,
      senha: dados.senha || undefined,
    });
    setUsuarioEditando(null);
  }

  async function handleConfirmarExclusao() {
    if (!usuarioExcluindo) return;
    await remover(usuarioExcluindo.id);
    setUsuarioExcluindo(null);
  }

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted">
            Equipe
          </span>
          <h1 className="font-heading font-semibold text-text text-xl md:text-2xl leading-tight">
            Funcionários
          </h1>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted">
            {usuarios.length === 1 ? "usuário" : "usuários"}
          </span>
          <span className="font-mono text-base md:text-lg font-semibold text-gold">
            {usuarios.length}
          </span>
        </div>
      </div>

      <div className="bg-card-soft rounded-lg shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shrink-0">
            <Plus size={16} className="text-gold-contrast" strokeWidth={2.25} />
          </div>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            Novo funcionário
          </span>
        </div>

        <UsuarioForm salvando={salvando} onSubmit={adicionar} />
      </div>

      <div className="bg-surface border border-border border-t-2 border-t-gold rounded-sm">
        <div className="flex items-center gap-2 px-4 md:px-6 py-4">
          <Users size={15} className="text-olive" strokeWidth={2} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted">
            {usuarios.length} {usuarios.length === 1 ? "usuário" : "usuários"}
          </span>
        </div>

        <div className="border-t border-dashed border-gold/25" />

        <ul>
          {usuarios.map((u, idx) => (
            <li key={u.id} className="group relative">
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-out" />
              <div className="flex items-center gap-3 px-4 md:px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-text truncate">{u.nome}</p>
                    <span
                      className={`font-mono text-[9px] tracking-wide uppercase rounded px-1.5 py-0.5 ${
                        u.role === "admin" ? "bg-gold/15 text-gold" : "bg-surface-alt text-text-muted"
                      }`}
                    >
                      {LABEL_ROLE[u.role]}
                    </span>
                    {u.id === usuarioAtual?.id && (
                      <span className="font-mono text-[9px] tracking-wide uppercase text-text-muted">
                        (você)
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-text-muted mt-0.5 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setUsuarioEditando(u)}
                    aria-label={`Editar ${u.nome}`}
                    className="p-3 -m-1 rounded-full text-text-muted hover:text-gold hover:bg-gold/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <Pencil size={16} />
                  </button>
                  {u.id !== usuarioAtual?.id && (
                    <button
                      onClick={() => setUsuarioExcluindo(u)}
                      aria-label={`Remover ${u.nome}`}
                      className="p-3 -m-1 rounded-full text-text-muted hover:text-paprika hover:bg-paprika/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              {idx < usuarios.length - 1 && (
                <div className="border-t border-dashed border-gold/25 mx-4 md:mx-6" />
              )}
            </li>
          ))}

          {usuarios.length === 0 && (
            <li className="px-6 py-12 text-center text-text-muted">
              <Users size={24} className="mx-auto mb-2" />
              Nenhum usuário cadastrado
            </li>
          )}
        </ul>
      </div>

      <Modal
        aberto={usuarioEditando !== null}
        onFechar={() => setUsuarioEditando(null)}
        titulo="Editar funcionário"
      >
        {usuarioEditando && (
          <UsuarioForm
            inicial={usuarioEditando}
            salvando={salvando}
            onSubmit={handleSalvarEdicao}
          />
        )}
      </Modal>

      <Modal
        aberto={usuarioExcluindo !== null}
        onFechar={() => setUsuarioExcluindo(null)}
        titulo="Remover funcionário"
      >
        <p className="text-sm text-text">
          Remover <span className="font-semibold">{usuarioExcluindo?.nome}</span> ({usuarioExcluindo?.email})?
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={() => setUsuarioExcluindo(null)}
            className="px-4 py-2 rounded-md text-sm font-heading text-text-muted hover:text-text hover:bg-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmarExclusao}
            disabled={salvando}
            className="px-4 py-2 rounded-md text-sm font-heading font-semibold text-white bg-paprika hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika"
          >
            Remover
          </button>
        </div>
      </Modal>
    </div>
  );
}
