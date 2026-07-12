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
import type { Pedido, StatusPedido } from "../types/pedido";
import { LABEL_ORIGEM, LABEL_STATUS } from "../types/pedido";
import { registrarLog } from "./logsService";

const pedidosRef = collection(db, "pedidos");

export function ouvirPedidos(callback: (pedidos: Pedido[]) => void) {
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);

  const q = query(
    pedidosRef,
    where("criadoEm", ">=", Timestamp.fromDate(inicioDoDia)),
    orderBy("criadoEm", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Pedido[];

    callback(pedidos);
  });
}

export async function criarPedido(pedido: Omit<Pedido, "id" | "criadoEm">) {
  await addDoc(pedidosRef, {
    ...pedido,
    criadoEm: serverTimestamp(),
  });
  await registrarLog({
    acao: "criar",
    entidade: "pedido",
    descricao: `Criou pedido "${pedido.mesa}" (${LABEL_ORIGEM[pedido.origem]})`,
  });
}

export async function atualizarStatusPedido(pedido: Pedido, status: StatusPedido) {
  if (!pedido.id) return;
  await updateDoc(doc(db, "pedidos", pedido.id), { status });
  await registrarLog({
    acao: "atualizar",
    entidade: "pedido",
    descricao: `Avançou pedido "${pedido.mesa}" para "${LABEL_STATUS[status]}"`,
  });
}

export async function removerPedido(pedido: Pedido) {
  if (!pedido.id) return;
  await deleteDoc(doc(db, "pedidos", pedido.id));
  await registrarLog({
    acao: "remover",
    entidade: "pedido",
    descricao: `Removeu pedido "${pedido.mesa}"`,
  });
}