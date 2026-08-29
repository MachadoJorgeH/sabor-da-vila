export const CATEGORIAS_CARDAPIO = [
  "Bebidas",
  "Lanches",
  "Massas",
  "Pizzas",
  "Prato Feito",
  "Sobremesas",
] as const;

export type CategoriaCardapio = (typeof CATEGORIAS_CARDAPIO)[number];

export interface ItemCardapio {
  id?: string;
  nome: string;
  preco: number;
  categoria: CategoriaCardapio;
}