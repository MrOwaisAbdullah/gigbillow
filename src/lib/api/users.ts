
'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

function getDocRef() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return null;
    return doc(db, 'users', userId);
}

export async function getUserProfile(): Promise<UserProfile | null> {
    const docRef = getDocRef();
    if (!docRef) return null;

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

export async function updateUserProfile(data: Partial<Omit<UserProfile, 'is_subscribed'>>): Promise<void> {
    const docRef = getDocRef();
    if (!docRef) {
        throw new Error('User not authenticated');
    }
    await updateDoc(docRef, data);
}

export async function updateUserSubscriptionStatus(is_subscribed: boolean): Promise<void> {
    const docRef = getDocRef();
    if (!docRef) {
        throw new Error('User not authenticated');
    }
    await updateDoc(docRef, { is_subscribed });
}
