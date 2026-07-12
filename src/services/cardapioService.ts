import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import type { ItemCardapio } from "../types/cardapio";
import { registrarLog } from "./logsService";

const cardapioRef = collection(db, "cardapio");

export function ouvirCardapio(callback: (itens: ItemCardapio[]) => void) {
  const q = query(cardapioRef, orderBy("nome", "asc"));
  return onSnapshot(q, (snapshot) => {
    const itens = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ItemCardapio[];
    callback(itens);
  });
}

export async function adicionarItemCardapio(item: Omit<ItemCardapio, "id">) {
  await addDoc(cardapioRef, item);
  await registrarLog({
    acao: "criar",
    entidade: "cardapio",
    descricao: `Adicionou "${item.nome}" ao cardápio`,
  });
}

export async function atualizarItemCardapio(id: string, item: Omit<ItemCardapio, "id">) {
  await updateDoc(doc(db, "cardapio", id), item);
  await registrarLog({
    acao: "atualizar",
    entidade: "cardapio",
    descricao: `Atualizou "${item.nome}" no cardápio`,
  });
}

export async function removerItemCardapio(item: ItemCardapio) {
  if (!item.id) return;
  await deleteDoc(doc(db, "cardapio", item.id));
  await registrarLog({
    acao: "remover",
    entidade: "cardapio",
    descricao: `Removeu "${item.nome}" do cardápio`,
  });
}