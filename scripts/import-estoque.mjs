import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const API_URL = process.env.API_URL ?? "http://localhost:5236";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin2@sabordavila.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const UNIDADE_PADRAO = "un";

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

function paraInventoryInput(doc) {
  return {
    name: doc.nome,
    quantity: Number(doc.quantidade) || 0,
    unit: doc.unidade ?? UNIDADE_PADRAO,
    costCents: Math.round(Number(doc.custo) * 100),
  };
}

async function main() {
  const token = await login();
  const snapshot = await db.collection("estoque").get();
  console.log(`Encontrados ${snapshot.size} itens no Firestore.`);

  let criados = 0;
  let falhas = 0;

  for (const doc of snapshot.docs) {
    const input = paraInventoryInput(doc.data());
    const resp = await fetch(`${API_URL}/api/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (resp.status === 201) {
      criados++;
      console.log(`  OK  ${input.name}`);
    } else {
      falhas++;
      console.log(`  XX  ${input.name} -> ${resp.status} ${await resp.text()}`);
    }
  }

  console.log(`\nResumo: ${criados} criados, ${falhas} falhas.`);
}

main().catch((erro) => {
  console.error("Erro na migracao:", erro);
  process.exit(1);
});