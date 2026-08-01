import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyB7sENsFn0XiRWnl1ddxwHO09iI1YxDvzM",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "avenira-games.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "avenira-games",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "avenira-games.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "388972625121",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:388972625121:web:8ccb1553df7d75b63d8ba0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const snap = await getDocs(collection(db, 'games'));
    snap.forEach(doc => console.log(doc.id));
  } catch (e) {
    console.error(e);
  }
}
run();
