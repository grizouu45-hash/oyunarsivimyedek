import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyB7sENsFn0XiRWnl1ddxwHO09iI1YxDvzM",
  authDomain: "avenira-games.firebaseapp.com",
  projectId: "avenira-games",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const gamesSnapshot = await getDocs(collection(db, "games"));
gamesSnapshot.forEach((doc) => {
  console.log(doc.data().title);
});
