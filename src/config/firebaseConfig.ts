// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClnZLANOxnKSojTv2pWt3nUol0KwxcLP4",
  authDomain: "melhoremcasatcc.firebaseapp.com",
  projectId: "melhoremcasatcc",
  storageBucket: "melhoremcasatcc.firebasestorage.app",
  messagingSenderId: "664879400651",
  appId: "1:664879400651:web:875eb7fabfaa9e6d55fd4e",
  measurementId: "G-C6PVNH2LYK"
};

// Initialize Firebase
export const appFirebase = initializeApp(firebaseConfig);
export const auth = getAuth(appFirebase);
export const db = getFirestore(appFirebase);