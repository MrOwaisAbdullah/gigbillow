import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, query, orderBy, limit, startAfter, endBefore, DocumentSnapshot } from 'firebase/firestore';
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
): Promise<{ clients: Client[], next: DocumentSnapshot | null, prev: DocumentSnapshot | null }> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return { clients: [], next: null, prev: null };
  try {
    const coll = collection(db, collectionPath);
    let q;

    if (page === 'first') {
        q = query(coll, orderBy('name'), limit(pageSize));
    } else if (page === 'next' && cursor) {
        q = query(coll, orderBy('name'), startAfter(cursor), limit(pageSize));
    } else if (page === 'prev' && cursor) {
        q = query(coll, orderBy('name', 'desc'), startAfter(cursor), limit(pageSize));
    } else {
        q = query(coll, orderBy('name'), limit(pageSize));
    }
    
    const querySnapshot = await getDocs(q);
    const clients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    
    if (page === 'prev') {
        clients.reverse();
    }

    const firstVisible = querySnapshot.docs[0];
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    // These will be used to determine if 'next' or 'prev' pages exist
    const hasNextQuery = query(coll, orderBy('name'), startAfter(lastVisible), limit(1));
    const hasNextSnap = await getDocs(hasNextQuery);
    
    const hasPrevQuery = query(coll, orderBy('name', 'desc'), startAfter(firstVisible), limit(1));
    const hasPrevSnap = await getDocs(hasPrevQuery);

    return { 
        clients, 
        next: hasNextSnap.docs.length > 0 ? lastVisible : null,
        prev: page === 'first' ? null : (hasPrevSnap.docs.length > 0 ? firstVisible : null),
     };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { clients: [], next: null, prev: null };
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
