import { api } from "../api/client";
import type { Venda } from "../types/venda";
import type { OrigemPedido } from "../types/pedido";

interface SaleItemApi {
  id: string;
  menuItemId: string | null;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

interface SaleApi {
  id: string;
  orderId: string | null;
  tableLabel: string;
  origin: string;
  note: string | null;
  totalCents: number;
  createdAt: string;
  items: SaleItemApi[];
}

const ORIGEM_DA_API: Record<string, OrigemPedido> = {
  hall: "salao",
  app: "app",
};

function paraVenda(sale: SaleApi): Venda {
  return {
    id: sale.id,
    pedidoId: sale.orderId ?? "",
    mesa: sale.tableLabel,
    origem: ORIGEM_DA_API[sale.origin] ?? "salao",
    observacao: sale.note ?? undefined,
    total: sale.totalCents / 100,
    criadoEm: sale.createdAt,
    itens: sale.items.map((item) => ({
      cardapioId: item.menuItemId ?? "",
      nome: item.name,
      precoUnitario: item.unitPriceCents / 100,
      quantidade: item.quantity,
    })),
  };
}

export async function listarVendas(inicio: Date, fim: Date): Promise<Venda[]> {
  const params = new URLSearchParams({
    from: inicio.toISOString(),
    to: fim.toISOString(),
  });
  const dados = await api.get<SaleApi[]>(`/api/sales?${params}`);
  return dados.map(paraVenda);
}
