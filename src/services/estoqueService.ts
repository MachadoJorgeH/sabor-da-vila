import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { ItemEstoque } from "../types/estoque";
import { registrarLog } from "./logsService";

const estoqueRef = collection(db, "estoque");

export function ouvirEstoque(callback: (itens: ItemEstoque[]) => void) {
  const q = query(estoqueRef, orderBy("criadoEm", "desc"));

  return onSnapshot(q, (snapshot) => {
    const itens = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ItemEstoque[];

    callback(itens);
  });
}

export async function adicionarItem(item: Omit<ItemEstoque, "id" | "criadoEm">) {
  await addDoc(estoqueRef, {
    ...item,
    criadoEm: serverTimestamp(),
  });
  await registrarLog({
    acao: "criar",
    entidade: "estoque",
    descricao: `Repôs "${item.nome}" no estoque (${item.quantidade} ${item.unidade})`,
  });
}

export async function removerItem(item: ItemEstoque) {
  if (!item.id) return;
  await deleteDoc(doc(db, "estoque", item.id));
  await registrarLog({
    acao: "remover",
    entidade: "estoque",
    descricao: `Removeu "${item.nome}" do estoque`,
  });
}

export type { Timestamp };