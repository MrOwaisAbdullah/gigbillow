'use client';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  deleteUser as firebaseDeleteUser,
  type UserCredential,
  type User,
} from 'firebase/auth';
import { app, db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { betaConfig, standardConfig } from './config';

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
    const userDocRef = doc(db, 'users', user.uid);
    const tokenRef = doc(db, 'user_tokens', user.uid);

    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
        // --- This is a new user ---
        const referralCode = generateReferralCode(6);
        
        const initialTokens = betaConfig.isActive ? betaConfig.newUserTokens : standardConfig.freeUser.newUserTokens;
        const initialSubStatus = betaConfig.isActive ? betaConfig.newUserIsSubscribed : standardConfig.freeUser.newUserIsSubscribed;
        const initialRollover = betaConfig.isActive ? betaConfig.newUserRolloverLimit : standardConfig.freeUser.newUserRolloverLimit;

        await setDoc(userDocRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            referral_code: referralCode,
            is_subscribed: initialSubStatus,
        });

        await setDoc(tokenRef, {
            balance: initialTokens,
            last_refill_at: serverTimestamp(),
            rollover_limit: initialRollover,
            is_subscribed: initialSubStatus,
        });
        
        // Handle referral
        const refCode = localStorage.getItem('referralCode');
        if (refCode) {
            // In a real app, this would trigger a backend function.
            console.log(`New user ${user.uid} was referred by code: ${refCode}`);
            localStorage.removeItem('referralCode');
        }

    } else {
        // --- This is an existing user ---
        const userData = userSnap.data();
        const updates: { [key: string]: any } = {};

        // Backfill referral code if missing
        if (!userData.referral_code) {
            updates.referral_code = generateReferralCode(6);
        }
        
        // Backfill subscription status if missing
        if (userData.is_subscribed === undefined) {
            updates.is_subscribed = false;
        }

        // Sync latest profile info from auth provider
        if (user.displayName && userData.displayName !== user.displayName) {
            updates.displayName = user.displayName;
        }
        if (user.photoURL && userData.photoURL !== user.photoURL) {
            updates.photoURL = user.photoURL;
        }

        if (Object.keys(updates).length > 0) {
            await updateDoc(userDocRef, updates);
        }
        
        // Also ensure token document exists for older users
        const tokenSnap = await getDoc(tokenRef);
        if (!tokenSnap.exists()) {
             await setDoc(tokenRef, {
                balance: 10,
                last_refill_at: serverTimestamp(),
                rollover_limit: 10,
                is_subscribed: false,
            });
        }
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
        // await updateProfile before initializeUser to ensure displayName is set
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: name });
        }
        // userCredential.user may not have the updated profile yet, so we re-read from auth.currentUser
        if (auth.currentUser) {
            // Must reload to get the updated profile from updateProfile call
            await auth.currentUser.reload();
            await initializeUser(auth.currentUser);
        }
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

export const updateUserPassword = async (newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to update your password.");
    }
    try {
        await firebaseUpdatePassword(user, newPassword);
    } catch (error: any) {
        console.error("Error updating password:", error);
        if (error.code === 'auth/requires-recent-login') {
            throw new Error("This operation is sensitive and requires recent authentication. Please log out and log back in before updating your password.");
        }
        throw new Error("Failed to update password. Please try again.");
    }
}

export const deleteUserAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to delete your account.");
    }

    try {
        const userId = user.uid;
        const batch = writeBatch(db);

        // Define all top-level user collections to delete
        const collectionsToDelete = ['clients', 'projects', 'timeEntries', 'invoices', 'expenses', 'referrals'];

        // This is a simplified deletion. In a production app, you might want to do this
        // in a Cloud Function for reliability, especially for large amounts of data.
        for (const coll of collectionsToDelete) {
            const snapshot = await getDocs(collection(db, `users/${userId}/${coll}`));
            snapshot.forEach(doc => batch.delete(doc.ref));
        }

        // Delete top-level user profile and token documents
        batch.delete(doc(db, 'users', userId));
        batch.delete(doc(db, 'user_tokens', userId));

        // Commit all Firestore deletions
        await batch.commit();

        // Finally, delete the user from Firebase Auth
        await firebaseDeleteUser(user);

    } catch (error: any) {
         console.error("Error deleting user account:", error);
         if (error.code === 'auth/requires-recent-login') {
            throw new Error("This operation is sensitive and requires recent authentication. Please log out and log back in before deleting your account.");
        }
        throw new Error("Failed to delete account. Please try again.");
    }
}
