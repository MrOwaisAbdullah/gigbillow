'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where, serverTimestamp, addDoc, doc } from 'firebase/firestore';
import type { Referral } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    return userId ? `referrals` : null; // Referrals are stored in a root collection
}

// Fetches referrals *made by* the current user.
export async function getReferrals(): Promise<Referral[]> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const collectionPath = getCollectionPath();
  if (!collectionPath) return [];

  const q = query(collection(db, collectionPath), where('referrer_user_id', '==', userId));
  
  const querySnapshot = await getDocs(q).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: collectionPath,
        operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });

  const referrals = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          ...data,
          created_at: data.created_at.toDate(),
      } as Referral
  });
  return referrals;
}

// This function would be called from a secure backend (e.g., Cloud Function)
// after a Stripe webhook confirms a new paid subscription.
// We include it here for completeness, but it's not directly used by the client.
export async function createReferral(referrerCode: string, referredStripeCustomerId: string, referredUserId: string): Promise<Referral | null> {
    
    // In a real backend, you would first find the user with the matching referrerCode
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referral_code', '==', referrerCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.error(`Referrer with code ${referrerCode} not found.`);
        return null;
    }
    const referrerUserDoc = querySnapshot.docs[0];
    const referrerUserId = referrerUserDoc.id;

    // Prevent self-referrals
    if (referrerUserId === referredUserId) {
        console.warn('User attempted to refer themselves.');
        return null;
    }

    const referralData = {
        referrer_user_id: referrerUserId,
        referred_stripe_cust_id: referredStripeCustomerId,
        reached_paid: true, // This is true because it's triggered by a payment webhook
        created_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'referrals'), referralData);
    
    // Here, you would trigger the Stripe coupon creation logic from the design document.
    // e.g., triggerStripeCouponCreation(referrerUserId);

    return { id: docRef.id, ...referralData, created_at: new Date() };
}
