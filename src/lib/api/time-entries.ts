'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import type { TimeEntry } from '@/lib/types';
import { startOfDay } from 'date-fns';
import { toast } from '@/hooks/use-toast';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    return userId ? `users/${userId}/timeEntries` : null;
}

function docToTimeEntry(doc: DocumentSnapshot): TimeEntry {
    const data = doc.data()!;
    
    const toDate = (ts: any) => {
        if (ts instanceof Timestamp) return ts.toDate();
        if (ts instanceof Date) return ts;
        // Handle cases where ts might be a string or number from localStorage
        return new Date(ts);
    };

    return {
        id: doc.id,
        ...data,
        startTime: toDate(data.startTime),
        endTime: data.endTime ? toDate(data.endTime) : null,
    } as TimeEntry;
}


export async function getTimeEntries(
    lastVisible: DocumentSnapshot | null = null,
    pageSize: number = 10
): Promise<{ entries: TimeEntry[], next: DocumentSnapshot | null }> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return { entries: [], next: null };
    
    try {
        const coll = collection(db, collectionPath);
        let q;
        if (lastVisible) {
            q = query(coll, orderBy('startTime', 'desc'), startAfter(lastVisible), limit(pageSize));
        } else {
            q = query(coll, orderBy('startTime', 'desc'), limit(pageSize));
        }
        
        const querySnapshot = await getDocs(q);

        const entries = querySnapshot.docs.map(docToTimeEntry);
        const next = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        return { entries, next };
    } catch(e) {
        return { entries: [], next: null };
    }
}

export async function getTodaysTimeEntries(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: DocumentSnapshot | null = null,
    pageSize: number = 5
): Promise<{ entries: TimeEntry[], next: DocumentSnapshot | null }> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return { entries: [], next: null };

    try {
        const todayStart = startOfDay(new Date());

        const baseQuery = [
            where('startTime', '>=', todayStart),
            orderBy('startTime', 'desc')
        ];

        const coll = collection(db, collectionPath);
        let q;
        if (cursor && page === 'next') {
            q = query(coll, ...baseQuery, startAfter(cursor), limit(pageSize));
        } else {
            q = query(coll, ...baseQuery, limit(pageSize));
        }


        const querySnapshot = await getDocs(q);
        const entries = querySnapshot.docs.map(docToTimeEntry);
        const next = querySnapshot.docs.length === pageSize ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

        return { entries, next };
    } catch (e) {
        console.error("Error fetching today's entries:", e);
        return { entries: [], next: null };
    }
}


export async function getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return [];

    try {
        const q = query(collection(db, collectionPath), where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToTimeEntry);
    } catch(e) {
        return [];
    }
}


export async function createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a time entry.' });
    throw new Error('User not authenticated');
  }
  const docRef = await addDoc(collection(db, collectionPath), entry);
  return { id: docRef.id, ...entry };
}

export async function updateTimeEntry(id: string, entry: Partial<Omit<TimeEntry, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update a time entry.' });
    throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, entry);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete a time entry.' });
    throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}
