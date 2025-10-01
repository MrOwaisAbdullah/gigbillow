import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { Client } from '@/lib/types';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    return `users/${userId}/clients`;
}

export async function getClients(): Promise<Client[]> {
  const collectionPath = getCollectionPath();
  const querySnapshot = await getDocs(collection(db, collectionPath));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  const collectionPath = getCollectionPath();
  const docRef = await addDoc(collection(db, collectionPath), client);
  return { id: docRef.id, ...client };
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, client);
}

export async function deleteClient(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}

export async function getClientById(id: string): Promise<Client | null> {
    const collectionPath = `users/${getAuth().currentUser?.uid}/clients`;
    const docRef = doc(db, collectionPath, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Client;
    } else {
        return null;
    }
}