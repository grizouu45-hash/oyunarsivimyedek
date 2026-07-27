import { db } from './src/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

async function run() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  let uid = null;
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.email === 'oyunarsivimadmin8@gmail.com' || data.email === 'sigvafevzican@gmail.com') {
      console.log("Found:", data.email, "=>", data.uid);
      if (data.email === 'oyunarsivimadmin8@gmail.com') {
        uid = data.uid;
      }
    }
  });
  console.log("Found target UID:", uid);
  
  if (uid) {
    // Write to admins collection
    await setDoc(doc(db, 'admins', uid), {
      email: 'oyunarsivimadmin8@gmail.com',
      role: 'admin',
      addedAt: new Date()
    });
    console.log("Added to admins collection!");
  } else {
    console.log("User not found in users collection.");
  }
}

run().catch(console.error);
