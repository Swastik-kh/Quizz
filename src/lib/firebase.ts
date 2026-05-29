
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAFt8G_YM6mT0k19ghynDtIINciOwV2WhQ",
  authDomain: "quizz-49ba6.firebaseapp.com",
  databaseURL: "https://quizz-49ba6-default-rtdb.firebaseio.com",
  projectId: "quizz-49ba6",
  storageBucket: "quizz-49ba6.firebasestorage.app",
  messagingSenderId: "1003395077123",
  appId: "1:1003395077123:web:31af89cc9f53ffeb36aa36",
  measurementId: "G-YW44GL0CW4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
