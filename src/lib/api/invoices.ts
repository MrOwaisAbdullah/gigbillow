'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Invoice } from '@/lib/types';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return null;
    return `users/${userId}/invoices`;
}


export async function getInvoices(): Promise<Invoice[]> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return [];

  const querySnapshot = await getDocs(collection(db, collectionPath));
  const invoices = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        issuedDate: data.issuedDate.toDate(),
        dueDate: data.dueDate.toDate(),
    } as Invoice
  });
  return invoices;
}

export async function createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = await addDoc(collection(db, collectionPath), invoice);
  return { id: docRef.id, ...invoice };
}

export async function updateInvoice(id: string, invoice: Partial<Omit<Invoice, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, invoice);
}

export async function deleteInvoice(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}
