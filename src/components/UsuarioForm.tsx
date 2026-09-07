import { useState } from "react";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { ApiError } from "../api/client";
import { ROLES, LABEL_ROLE } from "../types/usuario";
import type { Usuario, RoleUsuario } from "../types/usuario";

interface UsuarioFormProps {
  inicial?: Usuario;
  salvando: boolean;
  onSubmit: (dados: {
    email: string;
    senha: string;
    nome: string;
    role: RoleUsuario;
  }) => void | Promise<void>;
}

const inputClass =
  "w-full border border-border rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface text-text";
const labelClass =
  "block font-mono text-[11px] tracking-[0.15em] uppercase text-text-muted mb-1.5";

export default function UsuarioForm({ inicial, salvando, onSubmit }: UsuarioFormProps) {
  const editando = inicial !== undefined;
  const [email, setEmail] = useState(inicial?.email ?? "");
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<RoleUsuario>(inicial?.role ?? "operator");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome) return;
    if (!editando && (!email || !senha)) return;

    setErro("");
    setSucesso("");
    try {
      await onSubmit({ email, senha, nome, role });
    } catch (err) {
      if (err instanceof ApiError && err.code === "duplicate_email") {
        setErro("Este e-mail já está cadastrado.");
      } else if (err instanceof ApiError) {
        setErro(err.message);
      } else {
        setErro("Erro ao salvar. Tente de novo.");
      }
      return;
    }

    if (!editando) {
      setSucesso(`Funcionário "${nome}" adicionado.`);
      setEmail("");
      setNome("");
      setSenha("");
      setRole("operator");
    } else {
      setSenha("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
        <div className="flex-1 sm:min-w-52">
          <label className={labelClass}>E-mail</label>
          {editando ? (
            <p className="px-3 py-2 text-sm font-mono text-text-muted truncate">{email}</p>
          ) : (
            <input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="funcionario@sabordavila.com"
              className={inputClass}
            />
          )}
        </div>

        <div className="flex-1 sm:min-w-40">
          <label className={labelClass}>Nome</label>
          <input
            autoComplete="off"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Maria"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-52">
          <label className={labelClass}>Função</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleUsuario)}
            className={inputClass}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{LABEL_ROLE[r]}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 sm:min-w-40">
          <label className={labelClass}>{editando ? "Nova senha (opcional)" : "Senha"}</label>
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={editando ? "Deixe em branco para manter" : "Mín. 6 caracteres"}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {erro && (
        <p role="alert" aria-live="polite" className="text-sm text-paprika">
          {erro}
        </p>
      )}

      {sucesso && (
        <p role="status" aria-live="polite" className="text-sm text-olive">
          {sucesso}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-gradient hover:opacity-90 transition-opacity text-gold-contrast font-heading font-semibold px-5 py-3 sm:py-2.5 rounded-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        {editando ? <Pencil size={18} /> : <Plus size={18} />}
        {editando ? "Salvar alterações" : "Adicionar funcionário"}
      </button>
    </form>
  );
}
