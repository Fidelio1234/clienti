import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBObXk0KlKt5DgFVrtqDye-1RigtFXQp7E",
  authDomain: "clienti-1fdd6.firebaseapp.com",
  projectId: "clienti-1fdd6",
  storageBucket: "clienti-1fdd6.firebasestorage.app",
  messagingSenderId: "966224396260",
  appId: "1:966224396260:web:59abbe8e617c3b9ab9d1f1",
  measurementId: "G-FRKQ3D88ZT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);