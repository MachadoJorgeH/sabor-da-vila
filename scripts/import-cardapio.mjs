import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const API_URL = process.env.API_URL ?? "http://localhost:5236";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin2@sabordavila.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const CATEGORIA_PADRAO = "Lanches";

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

function paraMenuInput(doc) {
  return {
    name: doc.nome,
    priceCents: Math.round(Number(doc.preco) * 100),
    category: doc.categoria ?? CATEGORIA_PADRAO,
    photoUrl: null,
  };
}

async function main() {
  const token = await login();
  const snapshot = await db.collection("cardapio").get();
  console.log(`Encontrados ${snapshot.size} itens no Firestore.`);

  let criados = 0;
  let pulados = 0;
  let falhas = 0;

  for (const doc of snapshot.docs) {
    const input = paraMenuInput(doc.data());
    const resp = await fetch(`${API_URL}/api/menu`, {
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
    } else if (resp.status === 409) {
      pulados++;
      console.log(`  --  ${input.name} (ja existe, pulado)`);
    } else {
      falhas++;
      console.log(`  XX  ${input.name} -> ${resp.status} ${await resp.text()}`);
    }
  }

  console.log(`\nResumo: ${criados} criados, ${pulados} pulados, ${falhas} falhas.`);
}

main().catch((erro) => {
  console.error("Erro na migracao:", erro);
  process.exit(1);
});