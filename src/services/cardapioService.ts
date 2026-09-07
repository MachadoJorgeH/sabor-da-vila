import { api, API_BASE_URL } from "../api/client";
import type { ItemCardapio } from "../types/cardapio";

interface MenuItemApi {
  id: string;
  name: string;
  priceCents: number;
  category: string;
  photoUrl: string | null;
}

function absolutizar(url: string): string {
  return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
}

function paraItemCardapio(item: MenuItemApi): ItemCardapio {
  return {
    id: item.id,
    nome: item.name,
    preco: item.priceCents / 100,
    categoria: item.category as ItemCardapio["categoria"],
    foto: item.photoUrl ? absolutizar(item.photoUrl) : undefined,
  };
}

function paraMenuInput(item: Omit<ItemCardapio, "id">) {
  return {
    name: item.nome,
    priceCents: Math.round(item.preco * 100),
    category: item.categoria,
  };
}

export async function listarCardapio(): Promise<ItemCardapio[]> {
  const dados = await api.get<MenuItemApi[]>("/api/menu");
  return dados
    .map(paraItemCardapio)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function adicionarItemCardapio(item: Omit<ItemCardapio, "id">): Promise<ItemCardapio> {
  const criado = await api.post<MenuItemApi>("/api/menu", paraMenuInput(item));
  return paraItemCardapio(criado);
}

export async function atualizarItemCardapio(id: string, item: Omit<ItemCardapio, "id">) {
  await api.put(`/api/menu/${id}`, paraMenuInput(item));
}

export async function removerItemCardapio(item: ItemCardapio) {
  if (!item.id) return;
  await api.delete(`/api/menu/${item.id}`);
}

export async function enviarFotoItem(id: string, arquivo: File): Promise<void> {
  const form = new FormData();
  form.append("file", arquivo);
  await api.upload(`/api/menu/${id}/photo`, form);
}

export async function removerFotoItem(id: string): Promise<void> {
  await api.delete(`/api/menu/${id}/photo`);
}
