import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjBQFiSjQlPVxau15nGBggL5K3DdW58sE",
  authDomain: "transmind-72a5f.firebaseapp.com",
  projectId: "transmind-72a5f",
  storageBucket: "transmind-72a5f.firebasestorage.app",
  messagingSenderId: "804506591993",
  appId: "1:804506591993:web:caa1f4a8f19baa6e963828",
  measurementId: "G-DV7V66LVKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and DB instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
