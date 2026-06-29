import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, type UserCredential } from 'firebase/auth';
import { httpsCallable, type FunctionsError } from 'firebase/functions';
import { auth, db, functions } from './firebase';
import { accountIdFromEmail } from './mailboxAccounts';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

type GoogleTokenResponse = {
  oauthAccessToken?: string;
};

export interface ConnectResult {
  accountId: string;
  email: string;
  accessToken: string;
}

/** Google OAuth access token for Gmail API — NOT Firebase session refresh token. */
function googleAccessTokenFromCredential(result: UserCredential): string {
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const tokenResponse = (result as UserCredential & { _tokenResponse?: GoogleTokenResponse })._tokenResponse;
  const accessToken = credential?.accessToken ?? tokenResponse?.oauthAccessToken;
  if (!accessToken) {
    throw new Error('Google did not return a Gmail access token. Approve Gmail access and try again.');
  }
  return accessToken;
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

  const provider = new GoogleAuthProvider();
  provider.addScope(GMAIL_SCOPE);
  provider.setCustomParameters({ prompt: 'consent', access_type: 'offline' });

  const result = await signInWithPopup(auth, provider);
  const accessToken = googleAccessTokenFromCredential(result);

  const email = result.user.email;
  if (!email) throw new Error('No email on Google account');

  await setDoc(
    doc(db, 'users', uid, 'gmail_accounts', accountId),
    {
      email,
      label,
      refreshTokenEnc: accessToken,
      tokenKind: 'access',
      status: 'syncing',
      color,
      lastSyncAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { accountId, email, accessToken };
}

export { clearUserSubscriptions } from './clearUserSubscriptions';

export async function connectCurrentUserMailbox(uid: string, email: string): Promise<ConnectResult> {
  const accountId = accountIdFromEmail(email);
  const label = email.split('@')[0] ?? 'Primary';
  return connectGmailMailbox(uid, accountId, '#E94F3B', label);
}

export async function triggerGmailInitialSync(
  accountId: string,
  accessToken?: string,
): Promise<{ scanned: number; parsed: number }> {
  if (!functions) throw new Error('Cloud Functions not available');
  const fn = httpsCallable<
    { accountId: string; accessToken?: string },
    { scanned: number; parsed: number }
  >(functions, 'gmailInitialSync', { timeout: 540_000 });
  const res = await fn({ accountId, accessToken });
  return res.data;
}
