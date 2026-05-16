import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyC4FfqwgQGzMhYEEAfl_LwpX0lRcNn2e_A",
  authDomain: "milay-beauty.firebaseapp.com",
  projectId: "milay-beauty",
  storageBucket: "milay-beauty.firebasestorage.app",
  messagingSenderId: "536039226279",
  appId: "1:536039226279:web:a6656ef0fdc8b3b0dd5482"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);

export { app, db, auth, storage };
