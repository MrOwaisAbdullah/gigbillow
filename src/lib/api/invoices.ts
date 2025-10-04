'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { Invoice } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { enhanceInvoice as genkitEnhanceInvoice, type EnhanceInvoiceInput, type EnhanceInvoiceOutput } from '@/ai/flows/enhance-invoice';
import { firestore } from '@/lib/firebase-admin';

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
          amount: Number(data.amount) || 0,
          subTotal: Number(data.subTotal) || 0,
          taxRate: Number(data.taxRate) || 0,
      } as Invoice
    });
    // Sort by issue date, newest first
    invoices.sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime());
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

export async function getInvoiceById(id: string): Promise<Invoice | null> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return null;
    try {
        const docRef = doc(db, collectionPath, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                issuedDate: data.issuedDate.toDate(),
                dueDate: data.dueDate.toDate(),
                amount: Number(data.amount) || 0,
                subTotal: Number(data.subTotal) || 0,
                taxRate: Number(data.taxRate) || 0,
            } as Invoice;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

export async function getPublicInvoiceById(userId: string, invoiceId: string): Promise<any | null> {
    'use server';
    try {
        const docRef = firestore.collection('users').doc(userId).collection('invoices').doc(invoiceId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            if (!data) return null;

            // Basic user info - don't expose sensitive data
            const userRef = firestore.collection('users').doc(userId);
            const userSnap = await userRef.get();
            const user = userSnap.exists ? {
                displayName: userSnap.data()?.displayName || 'Freelancer',
                email: userSnap.data()?.email || ''
            } : { displayName: 'Freelancer', email: '' };

            const clientRef = firestore.collection('users').doc(userId).collection('clients').doc(data.clientId);
            const clientSnap = await clientRef.get();
            const client = clientSnap.exists ? clientSnap.data() : null;

            const projectRef = firestore.collection('users').doc(userId).collection('projects').doc(data.projectId);
            const projectSnap = await projectRef.get();
            const project = projectSnap.exists ? projectSnap.data() : null;
            
            return {
                invoice: {
                    id: docSnap.id,
                    ...data,
                    issuedDate: data.issuedDate.toDate().toISOString(),
                    dueDate: data.dueDate.toDate().toISOString(),
                },
                user,
                client,
                project,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching public invoice:", error);
        return null;
    }
}
