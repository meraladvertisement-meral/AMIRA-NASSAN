import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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