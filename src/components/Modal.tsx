import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: ReactNode;
}

export default function Modal({ aberto, onFechar, titulo, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    else if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === ref.current) onFechar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg bg-card-soft text-text shadow-xl backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading font-semibold text-text">{titulo}</h2>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="p-2 -m-2 rounded-full text-text-muted hover:text-text hover:bg-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <X size={18} />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </dialog>
  );
}