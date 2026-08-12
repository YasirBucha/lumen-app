import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  init: () => () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  init: () => {
    if (!auth || !isFirebaseConfigured) {
      set({ loading: false });
      return () => {};
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
    return unsub;
  },
  signIn: async () => {
    if (!auth) throw new Error('Firebase Auth is not configured');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== 'auth/popup-blocked' && code !== 'auth/operation-not-supported-in-this-environment') throw error;
      await signInWithRedirect(auth, googleProvider);
    }
  },
  signOut: async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  },
}));
