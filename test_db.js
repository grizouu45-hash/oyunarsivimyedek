import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7sENsFn0XiRWnl1ddxwHO09iI1YxDvzM",
  authDomain: "avenira-games.firebaseapp.com",
  projectId: "avenira-games",
  storageBucket: "avenira-games.firebasestorage.app",
  messagingSenderId: "388972625121",
  appId: "1:388972625121:web:8ccb1553df7d75b63d8ba0",
  measurementId: "G-0GKXK7G1X6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const docRef = doc(db, 'games', 'some-id');
    await getDoc(docRef);
    console.log("Success");
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
