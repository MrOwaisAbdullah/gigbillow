'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'studio-3171964454-e88e7',
  appId: '1:142364191275:web:fd4ec47c023177e968d86e',
  apiKey: 'AIzaSyB4DsBzqVgq3gqxMx3SETKnAIHIJvYgMPQ',
  authDomain: 'studio-3171964454-e88e7.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '142364191275',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
