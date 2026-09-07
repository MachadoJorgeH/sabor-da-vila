import { useCallback, useEffect, useState } from "react";
import { listarLogs } from "../services/logsService";
import type { LogAuditoria } from "../types/log";

export function useLogs(data: string) {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const [ano, mes, dia] = data.split("-").map(Number);
    const inicio = new Date(ano, mes - 1, dia);
    const fim = new Date(ano, mes - 1, dia + 1);
    setCarregando(true);
    try {
      setLogs(await listarLogs(inicio, fim));
    } catch (erro) {
      console.error("Falha ao carregar os logs:", erro);
    } finally {
      setCarregando(false);
    }
  }, [data]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { logs, carregando };
}
