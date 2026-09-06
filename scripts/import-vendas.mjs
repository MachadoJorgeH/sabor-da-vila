import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const API_URL = process.env.API_URL ?? "http://localhost:5236";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin2@sabordavila.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

const ORIGEM_PARA_API = {
  salao: "hall",
  app: "app",
};

initializeApp({
  credential: cert(
    JSON.parse(readFileSync("./scripts/serviceAccountKey.json", "utf8")),
  ),
});

const db = getFirestore();

async function login() {
  const resp = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!resp.ok) throw new Error(`login falhou: ${resp.status}`);
  const data = await resp.json();
  return data.token;
}

function paraSaleInput(doc) {
  const itens = Array.isArray(doc.itens) ? doc.itens : [];
  const input = {
    tableLabel: doc.mesa ?? "?",
    origin: ORIGEM_PARA_API[doc.origem] ?? "hall",
    note: doc.observacao ?? null,
    totalCents: Math.round(Number(doc.total) * 100),
    items: itens.map((item) => ({
      name: item.nome,
      unitPriceCents: Math.round(Number(item.precoUnitario) * 100),
      quantity: item.quantidade,
    })),
  };
  if (doc.criadoEm && typeof doc.criadoEm.toDate === "function") {
    input.createdAt = doc.criadoEm.toDate().toISOString();
  }
  return input;
}

async function main() {
  const token = await login();
  const snapshot = await db.collection("vendas").get();
  console.log(`Encontradas ${snapshot.size} vendas no Firestore.`);

  let criadas = 0;
  let falhas = 0;

  for (const doc of snapshot.docs) {
    const input = paraSaleInput(doc.data());
    const resp = await fetch(`${API_URL}/api/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (resp.status === 201) {
      criadas++;
      console.log(`  OK  ${input.tableLabel} (${input.items.length} itens)`);
    } else {
      falhas++;
      console.log(`  XX  ${input.tableLabel} -> ${resp.status} ${await resp.text()}`);
    }
  }

  console.log(`\nResumo: ${criadas} criadas, ${falhas} falhas.`);
}

main().catch((erro) => {
  console.error("Erro na migracao:", erro);
  process.exit(1);
});
