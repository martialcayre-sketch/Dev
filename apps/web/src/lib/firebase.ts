import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app server-side (safe), but only initialize client services on window
export const app = initializeApp(firebaseConfig);
export const auth = typeof window !== 'undefined' ? getAuth(app) : null;
export const db = typeof window !== 'undefined' ? getFirestore(app) : null;
export const storage = typeof window !== 'undefined' ? getStorage(app) : null;

// Connect to emulators in development (use NODE_ENV in Next.js)
if (process.env.NODE_ENV === 'development') {
  Promise.all([import('firebase/auth'), import('firebase/firestore'), import('firebase/storage')])
    .then(([mAuth, mFirestore, mStorage]) => {
      // dynamic import returns module namespace; functions are named exports
      if (mAuth && typeof mAuth.connectAuthEmulator === 'function' && auth) {
        mAuth.connectAuthEmulator(auth, 'http://localhost:9099');
      }
      if (mFirestore && typeof mFirestore.connectFirestoreEmulator === 'function' && db) {
        mFirestore.connectFirestoreEmulator(db, 'localhost', 8080);
      }
      if (mStorage && typeof mStorage.connectStorageEmulator === 'function' && storage) {
        mStorage.connectStorageEmulator(storage, 'localhost', 9199);
      }
    })
    .catch((e) => {
      // swallowing emulator connection errors in dev
      // console.warn('Could not connect to firebase emulators', e);
    });
}
