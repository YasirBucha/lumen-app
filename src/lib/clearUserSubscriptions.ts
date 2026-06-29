import { collection, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/** Remove stale/demo subscription docs before a fresh Gmail sync. */
export async function clearUserSubscriptions(uid: string): Promise<number> {
  if (!db) return 0;
  const snap = await getDocs(collection(db, 'users', uid, 'subscriptions'));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  return snap.size;
}
