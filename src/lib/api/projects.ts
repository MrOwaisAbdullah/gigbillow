'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import type { Project } from '@/lib/types';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return null;
    return `users/${userId}/projects`;
}

export async function getProjects(): Promise<Project[]> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return [];
  const querySnapshot = await getDocs(collection(db, collectionPath));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return [];
    const q = query(collection(db, collectionPath), where('clientId', '==', clientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = await addDoc(collection(db, collectionPath), project);
  return { id: docRef.id, ...project };
}

export async function updateProject(id: string, project: Partial<Omit<Project, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, project);
}

export async function deleteProject(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) throw new Error('User not authenticated');
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}

export async function getProjectById(id: string): Promise<Project | null> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return null;
    const docRef = doc(db, collectionPath, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Project;
    } else {
        return null;
    }
}
