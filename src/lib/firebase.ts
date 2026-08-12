import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { enableMultiTabIndexedDbPersistence, getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config';

export { isFirebaseConfigured };

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const functions = app ? getFunctions(app, 'asia-south1') : null;
export const googleProvider = new GoogleAuthProvider();

if (db && typeof window !== 'undefined') {
  void enableMultiTabIndexedDbPersistence(db).catch((error: { code?: string }) => {
    if (error.code !== 'failed-precondition' && error.code !== 'unimplemented') {
      console.warn('Firestore offline persistence unavailable', error);
    }
  });
}
