import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDxnTDZHY-Y9csnbhzuzxmcdLLfsCSLJPI",
  authDomain: "gatiel-fa7d9.firebaseapp.com",
  projectId: "gatiel-fa7d9",
  storageBucket: "gatiel-fa7d9.firebasestorage.app",
  messagingSenderId: "322054187894",
  appId: "1:322054187894:web:618c4eb3098f5d36222857",
  measurementId: "G-XXC4NQKZMB"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;