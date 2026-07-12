// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARaNPNTSU5hP0-WlBRVlZNkfZRS_OerUY",
  authDomain: "sabordavilarestaurante-d5c59.firebaseapp.com",
  projectId: "sabordavilarestaurante-d5c59",
  storageBucket: "sabordavilarestaurante-d5c59.firebasestorage.app",
  messagingSenderId: "281386466185",
  appId: "1:281386466185:web:8b88bbde33133725197f58",
  measurementId: "G-SZ42R2TH8L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Cache local persistente (IndexedDB): evita re-buscar dados já vistos ao
// trocar de tela ou reabrir o app, reduzindo leituras cobradas pelo Firestore.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
});
export const auth = getAuth(app);