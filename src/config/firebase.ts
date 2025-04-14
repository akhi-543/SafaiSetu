import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDZqGf1P_q6ChBs6lEODak9qIJvcV-WziA",
  authDomain: "ssbolt.firebaseapp.com",
  projectId: "ssbolt",
  storageBucket: "ssbolt.firebasestorage.app",
  messagingSenderId: "852127133138",
  appId: "1:852127133138:web:af3f700b10313fc0582c0b",
  measurementId: "G-98CTW52YEK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);