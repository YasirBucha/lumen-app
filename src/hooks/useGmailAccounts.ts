import { useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useSubStore } from '../store/subStore';
import type { GmailAccount } from '../types';

export function useGmailAccounts() {
  const user = useAuthStore((s) => s.user);
  const setGmailAccounts = useSubStore((s) => s.setGmailAccounts);

  useEffect(() => {
    if (!user || !db) {
      setGmailAccounts([]);
      return;
    }

    const ref = collection(db, 'users', user.uid, 'gmail_accounts');
    return onSnapshot(ref, (snap) => {
      const accounts = snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
          }) as GmailAccount,
      );
      setGmailAccounts(accounts);
    });
  }, [user, setGmailAccounts]);
}
