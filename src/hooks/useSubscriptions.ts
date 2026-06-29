import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useSubStore } from '../store/subStore';
import { SUBS_HEAVY } from '../lib/seedData';
import type { Subscription } from '../types';

export function useSubscriptions() {
  const user = useAuthStore((s) => s.user);
  const setSubscriptions = useSubStore((s) => s.setSubscriptions);

  useEffect(() => {
    if (!user || !db) {
      setSubscriptions(SUBS_HEAVY);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'subscriptions'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setSubscriptions(SUBS_HEAVY);
          return;
        }
        const subs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Subscription[];
        setSubscriptions(subs);
      },
      () => {
        setSubscriptions(SUBS_HEAVY);
      },
    );

    return unsub;
  }, [user, setSubscriptions]);
}
