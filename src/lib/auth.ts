
'use client';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type UserCredential,
  type User,
} from 'firebase/auth';
import { app, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

async function initializeUser(user: User) {
    const tokenRef = doc(db, 'user_tokens', user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if token document exists
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) {
        await setDoc(tokenRef, {
            balance: 10,
            last_refill_at: new Date(),
            rollover_limit: 10,
        });
    }

    // Check if user profile document exists
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      await setDoc(userDocRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });
    }
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
     if (result.user) {
        await initializeUser(result.user);
    }
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google: ', error);
    throw error;
  }
};

export const registerWithEmailAndPassword = async (name: string, email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: name });
        }
        await initializeUser(userCredential.user);
        return userCredential;
    } catch (error) {
        console.error("Error registering with email and password: ", error);
        throw error;
    }
};

export const signInWithEmailAndPasswordHandler = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // On sign-in, we also ensure the user is initialized in our DB
        await initializeUser(userCredential.user);
        return userCredential;
    } catch (error) {
        console.error("Error signing in with email and password: ", error);
        throw error;
    }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out: ', error);
  }
};
