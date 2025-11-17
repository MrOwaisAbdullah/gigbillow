'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, SupabasePermissionError } from '@/lib/errors';
import { useAuth } from './auth/auth-provider';

export function SecurityErrorListener() {
  const { user } = useAuth();

  useEffect(() => {
    const handlePermissionError = async (error: FirestorePermissionError | SupabasePermissionError) => {
      // For Supabase, we don't need an ID token in the same way Firebase uses it
      // Using user's ID and email for context instead
      const authContext = user ? {
        uid: user.id,
        email: user.email
      } : null;

      // Throw a new error that includes the auth context.
      // Next.js will catch this and display it in the development overlay.
      throw new Error(
        `${error.name}: Missing or insufficient permissions: The following request was denied by security rules:\n${JSON.stringify({ ...error.context, auth: authContext }, null, 2)}`
      );
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [user]);

  return null;
}
