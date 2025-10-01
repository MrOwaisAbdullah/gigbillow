'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Invoice } from '@/lib/types';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    return `users/${userId}/invoices`;
}


export async function getInvoices(): Promise<Invoice[]> {
  const querySnapshot = await getDocs(collection(db, getCollectionPath()));
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
  const docRef = await addDoc(collection(db, getCollectionPath()), invoice);
  return { id: docRef.id, ...invoice };
}

export async function updateInvoice(id: string, invoice: Partial<Omit<Invoice, 'id'>>): Promise<void> {
  const docRef = doc(db, getCollectionPath(), id);
  await updateDoc(docRef, invoice);
}

export async function deleteInvoice(id: string): Promise<void> {
  const docRef = doc(db, getCollectionPath(), id);
  await deleteDoc(docRef);
}
