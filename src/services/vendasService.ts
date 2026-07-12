import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { QueryConstraint } from "firebase/firestore";
import type { Venda } from "../types/venda";

const vendasRef = collection(db, "vendas");

export function ouvirVendas(
  callback: (vendas: Venda[]) => void,
  opcoes?: { inicio?: Date; fim?: Date }
) {
  const restricoes: QueryConstraint[] = [orderBy("criadoEm", "desc")];

  if (opcoes?.inicio) {
    restricoes.push(where("criadoEm", ">=", Timestamp.fromDate(opcoes.inicio)));
  }
  if (opcoes?.fim) {
    restricoes.push(where("criadoEm", "<", Timestamp.fromDate(opcoes.fim)));
  }

  const q = query(vendasRef, ...restricoes);

  return onSnapshot(q, (snapshot) => {
    const vendas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Venda[];

    callback(vendas);
  });
}

export async function registrarVenda(venda: Omit<Venda, "id" | "criadoEm">) {
  await addDoc(vendasRef, {
    ...venda,
    criadoEm: serverTimestamp(),
  });
}