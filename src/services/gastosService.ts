import { api } from "../api/client";
import type { Gasto, CategoriaGasto } from "../types/gasto";

interface ExpenseApi {
  id: string;
  description: string;
  category: string;
  amountCents: number;
  createdAt: string;
}

const CATEGORIA_PARA_API: Record<string, string> = {
  "Contas (água/luz/internet)": "Contas",
};

const CATEGORIA_DA_API: Record<string, string> = {
  Contas: "Contas (água/luz/internet)",
};

function paraGasto(expense: ExpenseApi): Gasto {
  return {
    id: expense.id,
    descricao: expense.description,
    categoria: (CATEGORIA_DA_API[expense.category] ?? expense.category) as CategoriaGasto,
    valor: expense.amountCents / 100,
    criadoEm: expense.createdAt,
  };
}

function paraExpenseInput(gasto: Omit<Gasto, "id" | "criadoEm">) {
  return {
    description: gasto.descricao,
    category: CATEGORIA_PARA_API[gasto.categoria] ?? gasto.categoria,
    amountCents: Math.round(gasto.valor * 100),
  };
}

export async function listarGastos(): Promise<Gasto[]> {
  const dados = await api.get<ExpenseApi[]>("/api/expenses");
  return dados
    .map(paraGasto)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function adicionarGasto(gasto: Omit<Gasto, "id" | "criadoEm">) {
  await api.post("/api/expenses", paraExpenseInput(gasto));
}

export async function atualizarGasto(id: string, gasto: Omit<Gasto, "id" | "criadoEm">) {
  await api.put(`/api/expenses/${id}`, paraExpenseInput(gasto));
}

export async function removerGasto(gasto: Gasto) {
  if (!gasto.id) return;
  await api.delete(`/api/expenses/${gasto.id}`);
}
