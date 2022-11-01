import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";

import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXWSgTpfxzQ0nTC0kMYXXl_iCz27OnCiY",
  authDomain: "record-board.firebaseapp.com",
  projectId: "record-board",
  storageBucket: "record-board.appspot.com",
  messagingSenderId: "266952680922",
  appId: "1:266952680922:web:f4f3943c69b9a0f3680ce3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Frebase Auth
export const auth = getAuth(app);

/// Initialize Realtime Database 
export const database = getDatabase(app);

export const ref = ref;

export const set = set;

export const signInWithEmailAndPassword = signInWithEmailAndPassword;

export const createUserWithEmailAndPassword = createUserWithEmailAndPassword;
