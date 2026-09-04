import { api } from "../api/client";
import type { ItemCardapio } from "../types/cardapio";

interface MenuItemApi {
  id: string;
  name: string;
  priceCents: number;
  category: string;
}

function paraItemCardapio(item: MenuItemApi): ItemCardapio {
  return {
    id: item.id,
    nome: item.name,
    preco: item.priceCents / 100,
    categoria: item.category as ItemCardapio["categoria"],
  };
}

function paraMenuInput(item: Omit<ItemCardapio, "id">) {
  return {
    name: item.nome,
    priceCents: Math.round(item.preco * 100),
    category: item.categoria,
    photoUrl: null,
  };
}

export async function listarCardapio(): Promise<ItemCardapio[]> {
  const dados = await api.get<MenuItemApi[]>("/api/menu");
  return dados
    .map(paraItemCardapio)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function adicionarItemCardapio(item: Omit<ItemCardapio, "id">) {
  await api.post("/api/menu", paraMenuInput(item));
}

export async function atualizarItemCardapio(id: string, item: Omit<ItemCardapio, "id">) {
  await api.put(`/api/menu/${id}`, paraMenuInput(item));
}

export async function removerItemCardapio(item: ItemCardapio) {
  if (!item.id) return;
  await api.delete(`/api/menu/${item.id}`);
}