import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Client } from '@/lib/types';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    return `users/${userId}/clients`;
}

export async function getClients(): Promise<Client[]> {
  const querySnapshot = await getDocs(collection(db, getCollectionPath()));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  const docRef = await addDoc(collection(db, getCollectionPath()), client);
  return { id: docRef.id, ...client };
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id'>>): Promise<void> {
  const docRef = doc(db, getCollectionPath(), id);
  await updateDoc(docRef, client);
}

export async function deleteClient(id: string): Promise<void> {
  const docRef = doc(db, getCollectionPath(), id);
  await deleteDoc(docRef);
}

export async function getClientById(id: string): Promise<Client | null> {
    const q = query(collection(db, getCollectionPath()), where('id', '==', id));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const clientDoc = querySnapshot.docs[0];
    return { id: clientDoc.id, ...clientDoc.data() } as Client;
}
