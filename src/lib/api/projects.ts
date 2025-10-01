'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Project } from '@/lib/types';

export async function getProjects(): Promise<Project[]> {
  const querySnapshot = await getDocs(collection(db, 'projects'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
    const q = query(collection(db, 'projects'), where('clientId', '==', clientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const docRef = await addDoc(collection(db, 'projects'), project);
  return { id: docRef.id, ...project };
}

export async function updateProject(id: string, project: Partial<Omit<Project, 'id'>>): Promise<void> {
  const docRef = doc(db, 'projects', id);
  await updateDoc(docRef, project);
}

export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, 'projects', id);
  await deleteDoc(docRef);
}

export async function getProjectById(id: string): Promise<Project | null> {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projectDoc = querySnapshot.docs.find(doc => doc.id === id);
    if (!projectDoc) return null;
    return { id: projectDoc.id, ...projectDoc.data() } as Project;
}
