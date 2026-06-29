import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { normalizeSubscription } from '../lib/normalizeSubscription';
import { useAuthStore } from '../store/authStore';
import { useSubStore } from '../store/subStore';

export function useSubscriptions() {
  const user = useAuthStore((s) => s.user);
  const gmailAccounts = useSubStore((s) => s.gmailAccounts);
  const setSubscriptions = useSubStore((s) => s.setSubscriptions);

  useEffect(() => {
    if (!user || !db) {
      setSubscriptions([]);
      return;
    }

    if (gmailAccounts.length === 0) {
      setSubscriptions([]);
      return;
    }

    const connectedIds = new Set(gmailAccounts.map((a) => a.id));

    const q = query(collection(db, 'users', user.uid, 'subscriptions'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const subs = snap.docs
          .map((doc) => normalizeSubscription(doc.id, doc.data() as Record<string, unknown>))
          .filter((s) => connectedIds.has(s.account));
        setSubscriptions(subs);
      },
      (err) => {
        console.error('subscriptions listener failed', err);
        setSubscriptions([]);
      },
    );

    return unsub;
  }, [user, gmailAccounts, setSubscriptions]);
}
