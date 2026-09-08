// Firebase Admin SDK initialization
// Uses service account JSON if available, otherwise operates in limited mode
import admin from 'firebase-admin';
import { config } from 'dotenv';
config();

let db = null;
let isInitialized = false;

try {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Full admin access with service account
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({ 
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'bhumi-sahyog',
      });
      isInitialized = true;
      console.log('✅ Firebase Admin: initialized with service account');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({ 
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || 'bhumi-sahyog',
      });
      isInitialized = true;
      console.log('✅ Firebase Admin: initialized with application default credentials');
    } else {
      console.warn('⚠️  Firebase Admin: No credentials found. Server will use context from frontend requests.');
      console.warn('   Set FIREBASE_SERVICE_ACCOUNT_JSON env var for full backend Firestore access.');
    }
  } else {
    isInitialized = true;
  }

  if (isInitialized) {
    db = admin.firestore();
  }
} catch (error) {
  console.error('❌ Firebase Admin init error:', error.message);
  console.warn('   Server will continue without Firestore access on backend.');
}

export { admin, db, isInitialized };
