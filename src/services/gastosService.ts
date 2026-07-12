import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { QueryConstraint } from "firebase/firestore";
import type { Gasto } from "../types/gasto";
import { registrarLog } from "./logsService";

const gastosRef = collection(db, "gastos");

export function ouvirGastos(
  callback: (gastos: Gasto[]) => void,
  opcoes?: { inicio?: Date; fim?: Date }
) {
  const restricoes: QueryConstraint[] = [orderBy("criadoEm", "desc")];

  if (opcoes?.inicio) {
    restricoes.push(where("criadoEm", ">=", Timestamp.fromDate(opcoes.inicio)));
  }
  if (opcoes?.fim) {
    restricoes.push(where("criadoEm", "<", Timestamp.fromDate(opcoes.fim)));
  }

  const q = query(gastosRef, ...restricoes);

  return onSnapshot(q, (snapshot) => {
    const gastos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Gasto[];

    callback(gastos);
  });
}

export async function adicionarGasto(gasto: Omit<Gasto, "id" | "criadoEm">) {
  await addDoc(gastosRef, {
    ...gasto,
    criadoEm: serverTimestamp(),
  });
  await registrarLog({
    acao: "criar",
    entidade: "gasto",
    descricao: `Lançou gasto "${gasto.descricao}" (R$ ${gasto.valor.toFixed(2)})`,
  });
}

export async function atualizarGasto(id: string, gasto: Omit<Gasto, "id" | "criadoEm">) {
  await updateDoc(doc(db, "gastos", id), gasto);
  await registrarLog({
    acao: "atualizar",
    entidade: "gasto",
    descricao: `Atualizou gasto "${gasto.descricao}" (R$ ${gasto.valor.toFixed(2)})`,
  });
}

export async function removerGasto(gasto: Gasto) {
  if (!gasto.id) return;
  await deleteDoc(doc(db, "gastos", gasto.id));
  await registrarLog({
    acao: "remover",
    entidade: "gasto",
    descricao: `Removeu gasto "${gasto.descricao}" (R$ ${gasto.valor.toFixed(2)})`,
  });
}