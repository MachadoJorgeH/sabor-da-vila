import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const API_URL = process.env.API_URL ?? "http://localhost:5236";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin2@sabordavila.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

const CATEGORIA_PARA_API = {
  "Contas (água/luz/internet)": "Contas",
};
const CATEGORIA_PADRAO = "Outros";

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

function paraExpenseInput(doc) {
  const categoria = doc.categoria ?? CATEGORIA_PADRAO;
  const input = {
    description: doc.descricao,
    category: CATEGORIA_PARA_API[categoria] ?? categoria,
    amountCents: Math.round(Number(doc.valor) * 100),
  };
  if (doc.criadoEm && typeof doc.criadoEm.toDate === "function") {
    input.createdAt = doc.criadoEm.toDate().toISOString();
  }
  return input;
}

async function main() {
  const token = await login();
  const snapshot = await db.collection("gastos").get();
  console.log(`Encontrados ${snapshot.size} gastos no Firestore.`);

  let criados = 0;
  let falhas = 0;

  for (const doc of snapshot.docs) {
    const input = paraExpenseInput(doc.data());
    const resp = await fetch(`${API_URL}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (resp.status === 201) {
      criados++;
      console.log(`  OK  ${input.description}`);
    } else {
      falhas++;
      console.log(`  XX  ${input.description} -> ${resp.status} ${await resp.text()}`);
    }
  }

  console.log(`\nResumo: ${criados} criados, ${falhas} falhas.`);
}

main().catch((erro) => {
  console.error("Erro na migracao:", erro);
  process.exit(1);
});
