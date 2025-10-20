import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, query, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import type { Client } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    return userId ? `users/${userId}/clients` : null;
}

export async function getClients(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: DocumentSnapshot | null = null,
    pageSize: number = 10
): Promise<{ clients: Client[], nextCursor: DocumentSnapshot | null, hasNextPage: boolean }> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return { clients: [], nextCursor: null, hasNextPage: false };
  try {
    const coll = collection(db, collectionPath);
    const queryLimit = pageSize + 1;
    let q;

    if (page === 'next' && cursor) {
        q = query(coll, orderBy('name'), startAfter(cursor), limit(queryLimit));
    } else { // Works for 'first' and 'prev' logic will be handled by cursors in component
        q = query(coll, orderBy('name'), limit(queryLimit));
    }
    
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    const hasNextPage = docs.length > pageSize;
    
    const clients = docs.slice(0, pageSize).map(doc => ({ id: doc.id, ...doc.data() } as Client));
    const nextCursor = hasNextPage ? docs[docs.length - 2] : null; // The second to last doc is the cursor for the next page
    
    // In this model, nextCursor for the *current* page's last item is what we need for the *next* "startAfter"
    const lastVisible = docs.length > 0 ? docs[docs.length - (hasNextPage ? 2 : 1)] : null;


    return { 
        clients,
        nextCursor: lastVisible,
        hasNextPage,
     };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { clients: [], nextCursor: null, hasNextPage: false };
  }
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a client.' });
    throw new Error('User not authenticated');
  }
  const docRef = await addDoc(collection(db, collectionPath), client);
  return { id: docRef.id, ...client };
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update a client.' });
    throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, client);
}

export async function deleteClient(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete a client.' });
    throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}

export async function getClientById(id: string): Promise<Client | null> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return null;
    try {
        const docRef = doc(db, collectionPath, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Client;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}
