import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA85ub_mt3sREAWKvAukkJj39nsBMttCb4",
  authDomain: "tingu-mingu.firebaseapp.com",
  projectId: "tingu-mingu",
  storageBucket: "tingu-mingu.firebasestorage.app",
  messagingSenderId: "657061112700",
  appId: "1:657061112700:web:9b99edff872c1cef7612f9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;