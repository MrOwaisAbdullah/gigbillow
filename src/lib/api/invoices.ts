'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Invoice } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { enhanceInvoice as genkitEnhanceInvoice, type EnhanceInvoiceInput, type EnhanceInvoiceOutput } from '@/ai/flows/enhance-invoice';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.warn('User not authenticated, returning null collection path');
    }
    return userId ? `users/${userId}/invoices` : null;
}


export async function getInvoices(): Promise<Invoice[]> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return [];

  try {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    const invoices = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          ...data,
          issuedDate: data.issuedDate.toDate(),
          dueDate: data.dueDate.toDate(),
          amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount || 0),
      } as Invoice
    });
    return invoices;
  } catch (error) {
      console.error("Failed to fetch invoices:", error);
      return [];
  }
}

export async function createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
     toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create an invoice.' });
     throw new Error('User not authenticated');
  }
  const docRef = await addDoc(collection(db, collectionPath), invoice);
  return { id: docRef.id, ...invoice };
}

export async function updateInvoice(id: string, invoice: Partial<Omit<Invoice, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
   if (!collectionPath) {
     toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update an invoice.' });
     throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, invoice);
}

export async function deleteInvoice(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
     toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete an invoice.' });
     throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}

export async function enhanceInvoice(input: EnhanceInvoiceInput): Promise<EnhanceInvoiceOutput> {
    return genkitEnhanceInvoice(input);
}
