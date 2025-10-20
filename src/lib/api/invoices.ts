import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, query, orderBy, Timestamp, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import type { Invoice, Client, Project, UserProfile } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

function getCollectionPath(userId?: string) {
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;
    const resolvedUserId = userId || currentUserId;
    if (!resolvedUserId) {
        console.warn('User not authenticated, returning null collection path');
    }
    return resolvedUserId ? `users/${resolvedUserId}/invoices` : null;
}


export async function getInvoices(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: DocumentSnapshot | null = null,
    pageSize: number = 10
): Promise<{ invoices: Invoice[], nextCursor: DocumentSnapshot | null, hasNextPage: boolean }> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return { invoices: [], nextCursor: null, hasNextPage: false };

  try {
    const coll = collection(db, collectionPath);
    const queryLimit = pageSize + 1;
    let q;

    if (page === 'next' && cursor) {
        q = query(coll, orderBy('issuedDate', 'desc'), startAfter(cursor), limit(queryLimit));
    } else {
        q = query(coll, orderBy('issuedDate', 'desc'), limit(queryLimit));
    }
    
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    const hasNextPage = docs.length > pageSize;

    const invoices = docs.slice(0, pageSize).map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          ...data,
          issuedDate: data.issuedDate.toDate(),
          dueDate: data.dueDate.toDate(),
          amount: Number(data.amount) || 0,
          subTotal: Number(data.subTotal) || 0,
          taxRate: Number(data.taxRate) || 0,
          discountValue: Number(data.discountValue) || 0,
          discountType: data.discountType || 'fixed',
          expensesTotal: Number(data.expensesTotal) || 0,
      } as Invoice
    });

    const lastVisible = docs.length > 0 ? docs[docs.length - (hasNextPage ? 2 : 1)] : null;

    return { 
        invoices, 
        nextCursor: lastVisible,
        hasNextPage
    };

  } catch (error) {
      console.error("Failed to fetch invoices:", error);
      return { invoices: [], nextCursor: null, hasNextPage: false };
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
                discountValue: Number(data.discountValue) || 0,
                discountType: data.discountType || 'fixed',
                expensesTotal: Number(data.expensesTotal) || 0,
            } as Invoice;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}


export async function getPublicInvoiceData(userId: string, invoiceId: string): Promise<{ invoice: Invoice, user: { displayName: string, email: string }, client: Client, project: Project } | null> {
    if (!userId || !invoiceId) return null;
    try {
        const invoiceRef = doc(db, `users/${userId}/invoices/${invoiceId}`);
        const invoiceSnap = await getDoc(invoiceRef);

        if (!invoiceSnap.exists()) {
            console.log('Public invoice not found');
            return null;
        }

        const invoiceData = invoiceSnap.data();
        const invoice = {
            id: invoiceSnap.id,
            ...invoiceData,
            issuedDate: (invoiceData.issuedDate as Timestamp).toDate(),
            dueDate: (invoiceData.dueDate as Timestamp).toDate(),
        } as Invoice;

        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);
        const user = userSnap.exists() ? userSnap.data() : { displayName: 'Freelancer', email: ''};
        
        const clientRef = doc(db, `users/${userId}/clients/${invoice.clientId}`);
        const clientSnap = await getDoc(clientRef);
        const client = clientSnap.exists() ? { id: clientSnap.id, ...clientSnap.data() } as Client : null;

        const projectRef = doc(db, `users/${userId}/projects/${invoice.projectId}`);
        const projectSnap = await getDoc(projectRef);
        const project = projectSnap.exists() ? { id: projectSnap.id, ...projectSnap.data() } as Project : null;

        if (!client || !project) {
            console.log('Client or Project not found for public invoice');
            return null;
        }

        return { invoice, user: user as any, client, project };

    } catch (error) {
        console.error("Error fetching public invoice data:", error);
        // It's important to not throw here to avoid crashing the client,
        // and instead return null to let the page handle the "not found" state.
        return null;
    }
}
