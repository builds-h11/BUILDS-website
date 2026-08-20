import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ─────────────────────────────────────────────────────────────────
// PASTE YOUR CONFIG HERE.
// Firebase Console → Project settings (gear icon) → General tab →
// "Your apps" → the web app you registered → SDK setup and
// configuration → "Config" radio button. Copy the whole object in
// and replace everything below.
//
// These values are safe to commit/share — they identify your project,
// they are not secret keys. Access is controlled by the Firestore
// rules you pasted in, not by hiding this object.
// ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA4LRSE66AKkSRmuUoism3Mb3W32DvdXQM",
  authDomain: "builds-web-f2c86.firebaseapp.com",
  projectId: "builds-web-f2c86",
  storageBucket: "builds-web-f2c86.firebasestorage.app",
  messagingSenderId: "639785145834",
  appId: "1:639785145834:web:54116d4579a1cb7504ce93"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
