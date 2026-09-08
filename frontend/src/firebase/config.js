// Firebase configuration for Bhumi Sahyog
import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDfZ71VfFWdTx24FUNjmXc7S-9nNVRDGjM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bhumi-sahyog.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://bhumi-sahyog-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bhumi-sahyog",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bhumi-sahyog.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1004964674029",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1004964674029:web:f90565d0fd41abbd884fe4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LM939SMX2B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

// Demo mode: true when no custom env vars are set
export const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY;
