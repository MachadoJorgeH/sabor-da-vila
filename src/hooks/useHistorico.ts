import { useEffect, useState } from "react";
import { ouvirVendas } from "../services/vendasService";
import type { Venda } from "../types/venda";

/** `data` no formato "AAAA-MM-DD". Busca só o dia selecionado no Firestore,
 * em vez de trazer o histórico inteiro de vendas e filtrar no cliente. */
export function useHistorico(data: string) {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const [ano, mes, dia] = data.split("-").map(Number);
    const inicio = new Date(ano, mes - 1, dia);
    const fim = new Date(ano, mes - 1, dia + 1);

    const unsubscribe = ouvirVendas(
      (dados) => {
        setVendas(dados);
        setCarregando(false);
      },
      { inicio, fim }
    );
    return () => unsubscribe();
  }, [data]);

  return { vendas, carregando };
}
