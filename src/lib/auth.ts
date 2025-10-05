
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
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function generateReferralCode(length: number) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


async function initializeUser(user: User) {
    const tokenRef = doc(db, 'user_tokens', user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if token document exists
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) {
        await setDoc(tokenRef, {
            balance: 10,
            last_refill_at: serverTimestamp(),
            rollover_limit: 10,
        });
    }

    // Check if user profile document exists
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      const referralCode = generateReferralCode(6);
      await setDoc(userDocRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        referral_code: referralCode,
      });

      // Handle referral
      const refCode = localStorage.getItem('referralCode');
      if (refCode) {
        // Here you would typically call a server-side function
        // to create the referral record, since we can't trust the client.
        // For this example, we'll log it.
        console.log(`New user ${user.uid} was referred by code: ${refCode}`);
        // In a real app, you'd do something like:
        // await createReferral({ referrerCode: refCode, newUserId: user.uid });
        localStorage.removeItem('referralCode');
      }

    } else if (!userSnap.data().referral_code) {
      // Backfill referral code for existing users
      const referralCode = generateReferralCode(6);
      await updateDoc(userDocRef, {
        referral_code: referralCode,
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
