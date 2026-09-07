import { useCallback, useEffect, useState } from "react";
import { listarVendas } from "../services/vendasService";
import type { Venda } from "../types/venda";

export function useHistorico(data: string) {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const [ano, mes, dia] = data.split("-").map(Number);
    const inicio = new Date(ano, mes - 1, dia);
    const fim = new Date(ano, mes - 1, dia + 1);
    setCarregando(true);
    try {
      setVendas(await listarVendas(inicio, fim));
    } catch (erro) {
      console.error("Falha ao carregar o histórico:", erro);
    } finally {
      setCarregando(false);
    }
  }, [data]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { vendas, carregando };
}
