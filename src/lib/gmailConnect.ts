import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable, type FunctionsError } from 'firebase/functions';
import { auth, db, functions } from './firebase';
import { waitForGmailAccountSync } from './waitForGmailSync';

export interface ConnectResult {
  accountId: string;
  email: string;
  accessToken?: string;
}

export function parseCallableError(err: unknown): string {
  const fe = err as FunctionsError;
  if (fe?.code && fe?.message) {
    const msg = fe.message;
    if (msg.includes('invalid_grant')) {
      return 'Gmail token expired or invalid. Click Try again and approve Gmail access when prompted.';
    }
    if (msg.includes('deadline-exceeded') || fe.code === 'functions/deadline-exceeded') {
      return 'Sync timed out. It may still be running — wait a minute and check Mailroom, then try again if needed.';
    }
    return `${fe.code.replace('functions/', '')}: ${msg}`;
  }
  if (err instanceof Error) return err.message;
  return 'Gmail sync failed';
}

export async function connectGmailMailbox(
  uid: string,
  accountId: string,
  color: string,
  label: string,
): Promise<ConnectResult> {
  if (!auth || !db) throw new Error('Firebase not configured');
  const email = auth.currentUser?.email;
  if (!email) throw new Error('No signed-in Google account');

  await setDoc(
    doc(db, 'users', uid, 'gmail_accounts', accountId),
    {
      email,
      label,
      status: 'syncing',
      color,
      lastSyncAt: serverTimestamp(),
    },
    { merge: true },
  );

  if (!functions) throw new Error('Cloud Functions not available');
  const fn = httpsCallable<
    { accountId: string; origin: string },
    { url: string }
  >(functions, 'gmailOAuthStart');
  try {
    const result = await fn({ accountId, origin: window.location.origin });
    window.location.assign(result.data.url);
    return new Promise<ConnectResult>(() => undefined);
  } catch (error) {
    await setDoc(doc(db, 'users', uid, 'gmail_accounts', accountId), { status: 'error' }, { merge: true });
    throw error;
  }
}

export async function triggerGmailSync(
  uid: string,
  accountId: string,
  opts?: { accessToken?: string; incremental?: boolean },
): Promise<{ scanned: number; parsed: number; subscriptions?: number; mode?: string }> {
  if (!functions) throw new Error('Cloud Functions not available');
  const fn = httpsCallable<
    { accountId: string; accessToken?: string; incremental?: boolean },
    { scanned: number; parsed: number; subscriptions?: number; mode?: string }
  >(functions, 'gmailInitialSync', { timeout: 540_000 });

  try {
    const data: { accountId: string; accessToken?: string; incremental?: boolean } = { accountId };
    if (opts?.accessToken) data.accessToken = opts.accessToken;
    if (opts?.incremental) data.incremental = true;
    return (await fn(data)).data;
  } catch (err) {
    const code = (err as FunctionsError)?.code;
    if (code !== 'functions/deadline-exceeded' && code !== 'functions/unavailable') throw err;
    const polled = await waitForGmailAccountSync(uid, accountId);
    return { scanned: 0, parsed: polled.parsedCount, mode: opts?.incremental ? 'incremental' : 'full' };
  }
}

export async function triggerGmailInitialSync(
  uid: string,
  accountId: string,
  accessToken?: string,
): Promise<{ scanned: number; parsed: number; subscriptions?: number }> {
  return triggerGmailSync(uid, accountId, { accessToken, incremental: false });
}
