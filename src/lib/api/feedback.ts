
'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Feedback } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

export async function createFeedback(feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<void> {
  const collectionPath = 'feedback';
  
  const dataToSave = {
      ...feedbackData,
      createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, collectionPath), dataToSave);
  } catch (serverError: any) {
    // We assume this will most likely be a permission error, but it could be other things.
    const permissionError = new FirestorePermissionError({
        path: collectionPath,
        operation: 'create',
        requestResourceData: dataToSave,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}
