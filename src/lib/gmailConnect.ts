import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

export interface ConnectResult {
  accountId: string;
  email: string;
}

export async function connectGmailMailbox(
  uid: string,
  accountId: string,
  color: string,
  label: string,
): Promise<ConnectResult> {
  if (!auth || !db) throw new Error('Firebase not configured');

  const provider = new GoogleAuthProvider();
  provider.addScope(GMAIL_SCOPE);
  provider.setCustomParameters({ prompt: 'consent', access_type: 'offline' });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken ?? '';

  const email = result.user.email;
  if (!email) throw new Error('No email on Google account');

  await setDoc(
    doc(db, 'users', uid, 'gmail_accounts', accountId),
    {
      email,
      label,
      refreshTokenEnc: token,
      status: 'synced',
      color,
      lastSyncAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { accountId, email };
}

export async function triggerGmailInitialSync(
  accountId: string,
): Promise<{ scanned: number; parsed: number } | null> {
  if (!functions) return null;
  try {
    const fn = httpsCallable<{ accountId: string }, { scanned: number; parsed: number }>(
      functions,
      'gmailInitialSync',
    );
    const res = await fn({ accountId });
    return res.data;
  } catch {
    return null;
  }
}
