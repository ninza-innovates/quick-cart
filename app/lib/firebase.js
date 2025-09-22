// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCg-brjPwPuqDkGqiEBiyyEVs-aJui82Bw",
  authDomain: "quick-cart-89e59.firebaseapp.com",
  projectId: "quick-cart-89e59",
  storageBucket: "quick-cart-89e59.firebasestorage.app",
  messagingSenderId: "733873567418",
  appId: "1:733873567418:web:27abf272437edba6cfb483",
  measurementId: "G-2K0F0TF8E2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
