'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    return userId ? `users/${userId}/projects` : null;
}

export async function getProjects(): Promise<Project[]> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return [];
  try {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    return projects.reverse(); // Show newest first
  } catch(e) {
    return [];
  }
}

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return [];
    try {
        const q = query(collection(db, collectionPath), where('clientId', '==', clientId));
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        return projects.reverse(); // Show newest first
    } catch(e) {
        return [];
    }
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a project.' });
    throw new Error('User not authenticated');
  }
  const docRef = await addDoc(collection(db, collectionPath), project);
  return { id: docRef.id, ...project };
}

export async function updateProject(id: string, project: Partial<Omit<Project, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
     toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update a project.' });
     throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, project);
}

export async function deleteProject(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete a project.' });
    throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}

export async function getProjectById(id: string): Promise<Project | null> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return null;
    try {
        const docRef = doc(db, collectionPath, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Project;
        } else {
            return null;
        }
    } catch(e) {
        return null;
    }
}
