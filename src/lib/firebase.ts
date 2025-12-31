'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQghdGBZ8joAguUfKtnqyosod-AjnpJH8",
  authDomain: "greenskillai.firebaseapp.com",
  projectId: "greenskillai",
  storageBucket: "greenskillai.firebasestorage.app",
  messagingSenderId: "486735776930",
  appId: "1:486735776930:web:97ce1a128a3b508059dbfb",
  measurementId: "G-80T417MMBJ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
