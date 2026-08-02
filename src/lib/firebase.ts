import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where, orderBy, enableIndexedDbPersistence, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Log seviyesini sessize alarak quota exceeded hatalarının konsola düşmesini engelliyoruz
setLogLevel('silent');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB7sENsFn0XiRWnl1ddxwHO09iI1YxDvzM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "avenira-games.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "avenira-games",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "avenira-games.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "388972625121",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:388972625121:web:8ccb1553df7d75b63d8ba0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0GKXK7G1X6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
  } else if (err.code == 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable persistence");
  }
});

const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
