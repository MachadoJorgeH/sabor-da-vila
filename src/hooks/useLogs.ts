import { useEffect, useState } from "react";
import { ouvirLogs } from "../services/logsService";
import type { LogAuditoria } from "../types/log";

/** `data` no formato "AAAA-MM-DD". Busca só o dia selecionado no Firestore,
 * em vez de trazer o log inteiro e filtrar no cliente. */
export function useLogs(data: string) {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const [ano, mes, dia] = data.split("-").map(Number);
    const inicio = new Date(ano, mes - 1, dia);
    const fim = new Date(ano, mes - 1, dia + 1);

    const unsubscribe = ouvirLogs(
      (dados) => {
        setLogs(dados);
        setCarregando(false);
      },
      { inicio, fim }
    );
    return () => unsubscribe();
  }, [data]);

  return { logs, carregando };
}
