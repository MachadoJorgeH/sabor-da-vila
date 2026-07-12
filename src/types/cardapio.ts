export const CATEGORIAS_CARDAPIO = [
  "Lanches",
  "Bebidas",
  "Sobremesas",
  "Pizzas",
  "Prato Feito",
] as const;

export type CategoriaCardapio = (typeof CATEGORIAS_CARDAPIO)[number];

export interface ItemCardapio {
  id?: string;
  nome: string;
  preco: number;
  categoria: CategoriaCardapio;
}