import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { QueryConstraint } from "firebase/firestore";
import type { AcaoLog, EntidadeLog, LogAuditoria } from "../types/log";

const logsRef = collection(db, "logs");

export async function registrarLog(entrada: {
  acao: AcaoLog;
  entidade: EntidadeLog;
  descricao: string;
}) {
  await addDoc(logsRef, {
    ...entrada,
    usuarioEmail: auth.currentUser?.email ?? "desconhecido",
    criadoEm: serverTimestamp(),
  });
}

export function ouvirLogs(
  callback: (logs: LogAuditoria[]) => void,
  opcoes?: { inicio?: Date; fim?: Date; max?: number }
) {
  const restricoes: QueryConstraint[] = [orderBy("criadoEm", "desc")];

  if (opcoes?.inicio) {
    restricoes.push(where("criadoEm", ">=", Timestamp.fromDate(opcoes.inicio)));
  }
  if (opcoes?.fim) {
    restricoes.push(where("criadoEm", "<", Timestamp.fromDate(opcoes.fim)));
  }
  restricoes.push(limit(opcoes?.max ?? 300));

  const q = query(logsRef, ...restricoes);

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LogAuditoria[];

    callback(logs);
  });
}
