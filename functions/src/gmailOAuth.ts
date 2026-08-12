import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import { defineSecret } from 'firebase-functions/params';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const ACCOUNT_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const STATE_TTL_MS = 10 * 60 * 1000;
const APP_HOSTS = new Set(['lumen-20260630.web.app', 'lumen-20260630.firebaseapp.com', 'localhost', '127.0.0.1']);

export const gmailClientId = defineSecret('GMAIL_CLIENT_ID');
export const gmailClientSecret = defineSecret('GMAIL_CLIENT_SECRET');

type OAuthState = {
  uid: string;
  accountId: string;
  origin: string;
  expiresAt: number;
  nonce: string;
};

function accountIdIsValid(accountId: string): boolean {
  return ACCOUNT_ID_RE.test(accountId);
}

function redirectUri(): string {
  const projectId = process.env.GCLOUD_PROJECT ?? process.env.GCP_PROJECT ?? 'lumen-20260630';
  return process.env.GMAIL_OAUTH_REDIRECT_URI ?? `https://asia-south1-${projectId}.cloudfunctions.net/gmailOAuthCallback`;
}

function allowedOrigin(origin: unknown): origin is string {
  if (typeof origin !== 'string') return false;
  try {
    const parsed = new URL(origin);
    return (parsed.protocol === 'https:' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') && APP_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

function stateRef(state: string) {
  return db.doc(`users/${statePayload(state).uid}/gmail_oauth_states/${createHash('sha256').update(state).digest('hex')}`);
}

function signedState(payload: OAuthState, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function statePayload(state: string): OAuthState {
  const [body] = state.split('.');
  const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OAuthState;
  if (!parsed.uid || !accountIdIsValid(parsed.accountId) || !allowedOrigin(parsed.origin)) {
    throw new Error('Invalid OAuth state');
  }
  return parsed;
}

function verifyState(state: string, secret: string): OAuthState {
  const [body, signature] = state.split('.');
  if (!body || !signature) throw new Error('Invalid OAuth state');
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Invalid OAuth state');
  }
  const payload = statePayload(state);
  if (payload.expiresAt < Date.now()) throw new Error('Expired OAuth state');
  return payload;
}

function queryString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
}

function callbackPage(origin: string, status: 'success' | 'error', accountId: string, message?: string): string {
  const payload = JSON.stringify({
    type: 'lumen-gmail-oauth',
    status,
    accountId,
    message: message ?? null,
  });
  const returnPath = status === 'success' ? '/scanning' : '/mailroom';
  const returnUrl = `${origin}${returnPath}?gmail=${status}&accountId=${encodeURIComponent(accountId)}`;
  return `<!doctype html><meta charset="utf-8"><title>Lumen Gmail</title><p>Returning to Lumen…</p><script>const payload=${payload};if(window.opener){window.opener.postMessage(payload,${JSON.stringify(origin)});window.close();}else{window.location.replace(${JSON.stringify(returnUrl)});}</script>`;
}

export const gmailOAuthStart = onCall(
  { region: 'asia-south1', secrets: [gmailClientId, gmailClientSecret] },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

    const accountId = request.data?.accountId as string | undefined;
    const origin = request.data?.origin as string | undefined;
    if (!accountId || !accountIdIsValid(accountId) || !allowedOrigin(origin)) {
      throw new HttpsError('invalid-argument', 'Invalid Gmail connection request');
    }

    const accountSnap = await db.doc(`users/${uid}/gmail_accounts/${accountId}`).get();
    if (!accountSnap.exists) throw new HttpsError('failed-precondition', 'Gmail account is not registered');

    const state: OAuthState = {
      uid,
      accountId,
      origin,
      expiresAt: Date.now() + STATE_TTL_MS,
      nonce: randomBytes(16).toString('hex'),
    };
    const stateValue = signedState(state, gmailClientSecret.value());
    await db.doc(`users/${uid}/gmail_oauth_states/${createHash('sha256').update(stateValue).digest('hex')}`).set({
      accountId,
      origin,
      expiresAt: admin.firestore.Timestamp.fromMillis(state.expiresAt),
    });

    const oauth = new google.auth.OAuth2(gmailClientId.value(), gmailClientSecret.value(), redirectUri());
    return {
      url: oauth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: true,
        scope: [GMAIL_SCOPE],
        state: stateValue,
        login_hint: accountSnap.data()?.email,
      }),
    };
  },
);

export const gmailOAuthCallback = onRequest(
  { region: 'asia-south1', secrets: [gmailClientId, gmailClientSecret] },
  async (req, res) => {
    const state = queryString(req.query.state);
    if (!state) {
      res.status(400).send('Missing OAuth state');
      return;
    }

    let payload: OAuthState;
    try {
      payload = verifyState(state, gmailClientSecret.value());
    } catch {
      res.status(400).send('Invalid OAuth state');
      return;
    }

    const stateDocument = stateRef(state);
    try {
      const storedState = await stateDocument.get();
      if (!storedState.exists) throw new Error('OAuth state already used or expired');

      const error = queryString(req.query.error);
      if (error) throw new Error('Google authorization was not completed');
      const code = queryString(req.query.code);
      if (!code) throw new Error('Missing Google authorization code');

      const oauth = new google.auth.OAuth2(gmailClientId.value(), gmailClientSecret.value(), redirectUri());
      const { tokens } = await oauth.getToken(code);
      if (!tokens.refresh_token) throw new Error('Google did not return a refresh token');

      oauth.setCredentials(tokens);
      const profile = await google.gmail({ version: 'v1', auth: oauth }).users.getProfile({ userId: 'me' });
      const email = profile.data.emailAddress;
      const accountRef = db.doc(`users/${payload.uid}/gmail_accounts/${payload.accountId}`);
      const accountSnap = await accountRef.get();
      if (!email || accountSnap.data()?.email !== email) throw new Error('Authorized Gmail account does not match the selected mailbox');

      await db.doc(`users/${payload.uid}/gmail_account_tokens/${payload.accountId}`).set({
        token: tokens.refresh_token,
        tokenKind: 'refresh',
        connectedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      await accountRef.set({ status: 'syncing', authMode: 'refresh' }, { merge: true });
      await stateDocument.delete();
      res.status(200).send(callbackPage(payload.origin, 'success', payload.accountId));
    } catch (error) {
      await stateDocument.delete().catch(() => undefined);
      console.error('gmailOAuthCallback error', {
        uid: payload.uid,
        accountId: payload.accountId,
        message: error instanceof Error ? error.message : String(error),
      });
      res.status(400).send(callbackPage(payload.origin, 'error', payload.accountId, 'Google authorization failed. Try again.'));
    }
  },
);
