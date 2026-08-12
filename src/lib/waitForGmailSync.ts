import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { GmailAccount } from '../types';

export interface SyncWaitResult {
  status: GmailAccount['status'];
  parsedCount: number;
}

/** Poll Firestore until gmail_accounts status settles — survives client callable timeouts. */
export function waitForGmailAccountSync(
  uid: string,
  accountId: string,
  timeoutMs = 540_000,
): Promise<SyncWaitResult> {
  if (!db) return Promise.reject(new Error('Firestore not configured'));
  const firestore = db;

  return new Promise((resolve, reject) => {
    const accountRef = doc(firestore, 'users', uid, 'gmail_accounts', accountId);
    const subsQuery = query(
      collection(firestore, 'users', uid, 'subscriptions'),
      where('account', '==', accountId),
    );

    let parsedCount = 0;
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubAccount();
      unsubSubs();
      fn();
    };

    const timer = setTimeout(() => {
      finish(() =>
        reject(new Error('Sync still running after 9 minutes. Check Mailroom — data may appear shortly.')),
      );
    }, timeoutMs);

    const unsubSubs = onSnapshot(
      subsQuery,
      (snap) => {
        parsedCount = snap.size;
      },
      () => undefined,
    );

    const unsubAccount = onSnapshot(
      accountRef,
      (snap) => {
        const data = snap.data() as GmailAccount | undefined;
        const status = data?.status;
        if (status === 'synced') {
          finish(() => resolve({ status: 'synced', parsedCount }));
        } else if (status === 'error') {
          finish(() => reject(new Error('Gmail sync failed on server. Connect again.')));
        }
      },
      (err) => finish(() => reject(err)),
    );
  });
}
