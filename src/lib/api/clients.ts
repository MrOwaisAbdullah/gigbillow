'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Client } from '@/lib/types';

export async function getClients(): Promise<Client[]> {
  const querySnapshot = await getDocs(collection(db, 'clients'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  const docRef = await addDoc(collection(db, 'clients'), client);
  return { id: docRef.id, ...client };
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id'>>): Promise<void> {
  const docRef = doc(db, 'clients', id);
  await updateDoc(docRef, client);
}

export async function deleteClient(id: string): Promise<void> {
  const docRef = doc(db, 'clients', id);
  await deleteDoc(docRef);
}

export async function getClientById(id: string): Promise<Client | null> {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    const clientDoc = querySnapshot.docs.find(doc => doc.id === id);
    if (!clientDoc) return null;
    return { id: clientDoc.id, ...clientDoc.data() } as Client;
}
