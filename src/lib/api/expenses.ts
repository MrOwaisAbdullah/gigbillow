
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
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import type { Expense } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    return userId ? `users/${userId}/expenses` : null;
}

function docToExpense(doc: DocumentSnapshot): Expense {
    const data = doc.data()!;
    return {
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate(),
    } as Expense;
}

export async function getExpenses(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: DocumentSnapshot | null = null,
    pageSize: number = 10
): Promise<{ expenses: Expense[], nextCursor: DocumentSnapshot | null, hasNextPage: boolean }> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return { expenses: [], nextCursor: null, hasNextPage: false };

    const coll = collection(db, collectionPath);
    const queryLimit = pageSize + 1; 
    let q;
    
    if (page === 'next' && cursor) {
        q = query(coll, orderBy('date', 'desc'), startAfter(cursor), limit(queryLimit));
    } else {
        q = query(coll, orderBy('date', 'desc'), limit(queryLimit));
    }

    const querySnapshot = await getDocs(q).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: collectionPath,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });

    const docs = querySnapshot.docs;
    const hasNextPage = docs.length > pageSize;
    
    const expenses = docs.slice(0, pageSize).map(docToExpense);
    const lastVisible = docs.length > 0 ? docs[docs.length - (hasNextPage ? 2 : 1)] : null;

    return { expenses, nextCursor: lastVisible, hasNextPage };
}


export async function getUninvoicedExpensesByProject(projectId: string): Promise<Expense[]> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return [];

  const q = query(
    collection(db, collectionPath),
    where('projectId', '==', projectId),
    where('invoiceId', '==', null)
  );

  const querySnapshot = await getDocs(q).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: collectionPath,
        operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
  return querySnapshot.docs.map(docToExpense);
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create an expense.' });
    throw new Error('User not authenticated');
  }

  const expenseData = { ...expense, invoiceId: null };

  const docRef = await addDoc(collection(db, collectionPath), expenseData).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: collectionPath,
        operation: 'create',
        requestResourceData: expenseData,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
  return { id: docRef.id, ...expenseData } as Expense;
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update an expense.' });
    throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, expense).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: expense,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}

export async function deleteExpense(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete an expense.' });
    throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}

export async function markExpensesAsInvoiced(expenseIds: string[], invoiceId: string) {
    const collectionPath = getCollectionPath();
    if (!collectionPath) {
        throw new Error('User not authenticated');
    }
    const batch = writeBatch(db);
    expenseIds.forEach(expenseId => {
        const docRef = doc(db, collectionPath, expenseId);
        batch.update(docRef, { invoiceId: invoiceId, includeOnInvoice: true });
    });
    await batch.commit().catch((serverError) => {
        // This is a simplification. A real app might need more granular error handling per-document.
        const permissionError = new FirestorePermissionError({
            path: collectionPath,
            operation: 'update',
            requestResourceData: { invoiceId: invoiceId, includeOnInvoice: true }
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });
}
