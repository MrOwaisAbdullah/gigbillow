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

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    return `users/${userId}/timeEntries`;
}

export async function getTimeEntries(
    lastVisible: DocumentSnapshot | null = null,
    pageSize: number = 10
): Promise<{ entries: TimeEntry[], next: DocumentSnapshot | null }> {
    const coll = collection(db, getCollectionPath());
    let q;
    if (lastVisible) {
        q = query(coll, orderBy('startTime', 'desc'), startAfter(lastVisible), limit(pageSize));
    } else {
        q = query(coll, orderBy('startTime', 'desc'), limit(pageSize));
    }
    
    const querySnapshot = await getDocs(q);

    const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
            endTime: data.endTime ? (data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime)) : null,
        } as TimeEntry;
    });

    const next = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { entries, next };
}

export async function getTodaysTimeEntries(): Promise<TimeEntry[]> {
    const todayStart = startOfDay(new Date());

    const q = query(
        collection(db, getCollectionPath()),
        where('startTime', '>=', todayStart),
        orderBy('startTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
            endTime: data.endTime ? (data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime)) : null,
        } as TimeEntry;
    });
    return entries;
}


export async function getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    const q = query(collection(db, getCollectionPath()), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
     const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const startTime = data.startTime;
        const endTime = data.endTime;
        return {
            id: doc.id,
            ...data,
            startTime: startTime?.toDate ? startTime.toDate() : new Date(startTime),
            endTime: endTime ? (endTime?.toDate ? endTime.toDate() : new Date(endTime)) : null,
        } as TimeEntry;
    });
    return entries;
}


export async function createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
  const docRef = await addDoc(collection(db, getCollectionPath()), entry);
  return { id: docRef.id, ...entry };
}

export async function updateTimeEntry(id: string, entry: Partial<Omit<TimeEntry, 'id'>>): Promise<void> {
  const docRef = doc(db, getCollectionPath(), id);
  await updateDoc(docRef, entry);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const docRef = doc(db, getCollectionPath(), id);
  await deleteDoc(docRef);
}
