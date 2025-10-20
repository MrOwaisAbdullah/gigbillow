'use client';

import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc, orderBy, limit, startAfter, endBefore, DocumentSnapshot } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

function getCollectionPath() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    return userId ? `users/${userId}/projects` : null;
}

export async function getProjects(
    page: 'first' | 'next' | 'prev' = 'first',
    cursor: DocumentSnapshot | null = null,
    pageSize: number = 10
): Promise<{ projects: Project[], nextCursor: DocumentSnapshot | null, hasNextPage: boolean }> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) return { projects: [], nextCursor: null, hasNextPage: false };
  
    const coll = collection(db, collectionPath);
    const queryLimit = pageSize + 1;
    let q;

    if (page === 'next' && cursor) {
        q = query(coll, orderBy('name'), startAfter(cursor), limit(queryLimit));
    } else {
        q = query(coll, orderBy('name'), limit(queryLimit));
    }
    
    const querySnapshot = await getDocs(q).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: collectionPath,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });

    const docs = querySnapshot.docs;
    const hasNextPage = docs.length > pageSize;

    const projects = docs.slice(0, pageSize).map(doc => ({ id: doc.id, ...doc.data() } as Project));
    const lastVisible = docs.length > 0 ? docs[docs.length - (hasNextPage ? 2 : 1)] : null;
    
    return { 
        projects, 
        nextCursor: lastVisible,
        hasNextPage
    };
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
  const docRef = await addDoc(collection(db, collectionPath), project).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: collectionPath,
        operation: 'create',
        requestResourceData: project,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
  return { id: docRef.id, ...project };
}

export async function updateProject(id: string, project: Partial<Omit<Project, 'id'>>): Promise<void> {
  const collectionPath = getCollectionPath();
   if (!collectionPath) {
     toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to update a project.' });
     throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, project).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: project,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}

export async function deleteProject(id: string): Promise<void> {
  const collectionPath = getCollectionPath();
  if (!collectionPath) {
    toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to delete a project.' });
    throw new Error('User not authenticated');
  }
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
    const collectionPath = getCollectionPath();
    if (!collectionPath) return null;
    
    const docRef = doc(db, collectionPath, id);
    const docSnap = await getDoc(docRef).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Project;
    } else {
        return null;
    }
}
