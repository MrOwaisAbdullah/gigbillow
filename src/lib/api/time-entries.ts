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
            startTime: data.startTime.toDate(),
            endTime: data.endTime ? data.endTime.toDate() : null,
        } as TimeEntry;
    });

    const next = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { entries, next };
}

export async function getTodaysTimeEntries(): Promise<TimeEntry[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayTimestamp = Timestamp.fromDate(startOfDay);

    const q = query(
        collection(db, getCollectionPath()),
        where('startTime', '>=', startOfDayTimestamp),
        orderBy('startTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startTime: data.startTime.toDate(),
            endTime: data.endTime ? data.endTime.toDate() : null,
        } as TimeEntry;
    });
    return entries;
}


export async function getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    const q = query(collection(db, getCollectionPath()), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
     const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            startTime: data.startTime.toDate(),
            endTime: data.endTime ? data.endTime.toDate() : null,
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
