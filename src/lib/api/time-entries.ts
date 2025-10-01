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
    if (!userId) return null;
    return `users/${userId}/timeEntries`;
}

function docToTimeEntry(doc: DocumentSnapshot): TimeEntry {
    const data = doc.data()!;
    const startTime = data.startTime;
    const endTime = data.endTime;
    return {
        id: doc.id,
        ...data,
        startTime: startTime instanceof Timestamp ? startTime.toDate() : new Date(startTime),
        endTime: endTime ? (endTime instanceof Timestamp ? endTime.toDate() : new Date(endTime)) : null,
    } as TimeEntry;
}

export async function getTimeEntries(
    lastVisible: DocumentSnapshot | null = null,
    pageSize: number = 10
): Promise<{ entries: TimeEntry[], next: DocumentSnapshot | null }> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return { entries: [], next: null };
    
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
}

export async function getTodaysTimeEntries(): Promise<TimeEntry[]> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return [];

    const todayStart = startOfDay(new Date());

    const q = query(
        collection(db, collectionPath),
        where('startTime', '>=', todayStart),
        orderBy('startTime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToTimeEntry);
}


export async function getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return [];

    const q = query(collection(db, collectionPath), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToTimeEntry);
}


export async function createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = await addDoc(collection(db, collectionPath), entry);
  return { id: docRef.id, ...entry };
}

export async function updateTimeEntry(id: string, entry: Partial<Omit<TimeEntry, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, entry);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}
