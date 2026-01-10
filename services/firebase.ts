
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7ekrMDpS8bpkCOiLpy2eKBRbUhid_Rno",
  authDomain: "snapquizgame-v.firebaseapp.com",
  projectId: "snapquizgame-v",
  storageBucket: "snapquizgame-v.appspot.com",
  messagingSenderId: "721857567700",
  appId: "1:721857567700:web:0d3ee1c53412b2ea745441"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
