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
import { doc, setDoc } from 'firebase/firestore';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

async function initializeUserToken(user: User) {
    const tokenRef = doc(db, 'user_tokens', user.uid);
    await setDoc(tokenRef, {
        balance: 10,
        last_refill_at: new Date(),
        rollover_limit: 0,
    });
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
     if (result.user) {
        await initializeUserToken(result.user);
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
        await initializeUserToken(userCredential.user);
        return userCredential;
    } catch (error) {
        console.error("Error registering with email and password: ", error);
        throw error;
    }
};

export const signInWithEmailAndPasswordHandler = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
