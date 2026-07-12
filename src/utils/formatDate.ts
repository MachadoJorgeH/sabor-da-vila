import type { Timestamp } from "firebase/firestore";

export function formatarHora(timestamp?: Timestamp): string {
  if (!timestamp) return "--:--";

  return timestamp.toDate().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarDataHora(timestamp?: Timestamp): string {
  if (!timestamp) return "";

  return timestamp.toDate().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}