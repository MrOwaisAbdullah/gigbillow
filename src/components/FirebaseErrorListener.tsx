'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useAuth } from './auth/auth-provider';

export function FirebaseErrorListener() {
  const { user } = useAuth();

  useEffect(() => {
    const handlePermissionError = async (error: FirestorePermissionError) => {
      // Get the current user's ID token.
      const idToken = await user?.getIdToken();
      // Throw a new error that includes the auth context.
      // Next.js will catch this and display it in the development overlay.
      throw new Error(
        `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify({ ...error.context, auth: { uid: user?.uid, token: idToken } }, null, 2)}`
      );
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [user]);

  return null;
}
