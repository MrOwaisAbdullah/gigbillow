'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Project } from '@/lib/types';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    return `users/${userId}/projects`;
}

export async function getProjects(): Promise<Project[]> {
  const querySnapshot = await getDocs(collection(db, getCollectionPath()));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
    const q = query(collection(db, getCollectionPath()), where('clientId', '==', clientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const docRef = await addDoc(collection(db, getCollectionPath()), project);
  return { id: docRef.id, ...project };
}

export async function updateProject(id: string, project: Partial<Omit<Project, 'id'>>): Promise<void> {
  const docRef = doc(db, getCollectionPath(), id);
  await updateDoc(docRef, project);
}

export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, getCollectionPath(), id);
  await deleteDoc(docRef);
}

export async function getProjectById(id: string): Promise<Project | null> {
    const q = query(collection(db, getCollectionPath()), where('id', '==', id));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const projectDoc = querySnapshot.docs[0];
    return { id: projectDoc.id, ...projectDoc.data() } as Project;
}
