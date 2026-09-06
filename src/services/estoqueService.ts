import { api } from "../api/client";
import type { ItemEstoque } from "../types/estoque";

interface InventoryItemApi {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costCents: number;
  createdAt: string;
}

function paraItemEstoque(item: InventoryItemApi): ItemEstoque {
  return {
    id: item.id,
    nome: item.name,
    quantidade: item.quantity,
    unidade: item.unit,
    custo: item.costCents / 100,
  };
}

function paraInventoryInput(item: Omit<ItemEstoque, "id">) {
  return {
    name: item.nome,
    quantity: item.quantidade,
    unit: item.unidade,
    costCents: Math.round(item.custo * 100),
  };
}

export async function listarEstoque(): Promise<ItemEstoque[]> {
  const dados = await api.get<InventoryItemApi[]>("/api/inventory");
  return dados
    .map(paraItemEstoque)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function adicionarItem(item: Omit<ItemEstoque, "id">) {
  await api.post("/api/inventory", paraInventoryInput(item));
}

export async function removerItem(item: ItemEstoque) {
  if (!item.id) return;
  await api.delete(`/api/inventory/${item.id}`);
}