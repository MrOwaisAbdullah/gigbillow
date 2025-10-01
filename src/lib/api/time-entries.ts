'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { TimeEntry } from '@/lib/types';

export async function getTimeEntries(): Promise<TimeEntry[]> {
    const querySnapshot = await getDocs(collection(db, 'timeEntries'));
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
    const q = query(collection(db, 'timeEntries'), where('projectId', '==', projectId));
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
  const docRef = await addDoc(collection(db, 'timeEntries'), entry);
  return { id: docRef.id, ...entry };
}

export async function updateTimeEntry(id: string, entry: Partial<Omit<TimeEntry, 'id'>>): Promise<void> {
  const docRef = doc(db, 'timeEntries', id);
  await updateDoc(docRef, entry);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const docRef = doc(db, 'timeEntries', id);
  await deleteDoc(docRef);
}
