import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDccl0dBrjUnRvG_gv0DYyf212w2UYjNf8",
  authDomain: "helix-ide.firebaseapp.com",
  projectId: "helix-ide",
  storageBucket: "helix-ide.firebasestorage.app",
  messagingSenderId: "157299881503",
  appId: "1:157299881503:web:71b2b30524a2dfaac7c72a",
  measurementId: "G-V8FW1GZZ4D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;