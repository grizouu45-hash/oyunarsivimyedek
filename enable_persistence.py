import re

with open('src/lib/firebase.ts', 'r') as f:
    text = f.read()

# Replace getFirestore with enableIndexedDbPersistence as well
text = text.replace('import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where, orderBy } from "firebase/firestore";',
                    'import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where, orderBy, enableIndexedDbPersistence } from "firebase/firestore";')

text = text.replace('const db = getFirestore(app);',
                    '''const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
  } else if (err.code == 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable persistence");
  }
});''')

with open('src/lib/firebase.ts', 'w') as f:
    f.write(text)
