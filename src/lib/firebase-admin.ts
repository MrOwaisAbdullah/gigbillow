import * as admin from 'firebase-admin';

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

function getFirestoreAdmin() {
  initializeAdminApp();
  return admin.firestore();
}

function getStorageAdmin() {
  initializeAdminApp();
  return admin.storage();
}

export { getFirestoreAdmin, getStorageAdmin };
