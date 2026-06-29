import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import { PARSERS } from './parsers';
import type { GmailMessageLite } from './parsers/types';
import { geminiParse } from './geminiParser';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const GMAIL_QUERY =
  'from:(billing OR receipts OR renewal OR invoice OR no-reply) newer_than:5y';

export async function parseMessage(msg: GmailMessageLite, geminiKey?: string) {
  for (const parser of PARSERS) {
    if (parser.matches(msg)) {
      const result = parser.parse(msg);
      if (result && result.confidence >= 0.7) {
        return { result, parserUsed: parser.id };
      }
    }
  }
  if (geminiKey) {
    const result = await geminiParse(msg, geminiKey);
    if (result) return { result, parserUsed: 'gemini' };
  }
  return null;
}

function decodeBody(data?: string | null): string {
  if (!data) return '';
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function toMessageLite(msg: {
  id?: string | null;
  snippet?: string | null;
  internalDate?: string | null;
  payload?: {
    headers?: Array<{ name?: string | null; value?: string | null }>;
    body?: { data?: string | null };
    parts?: Array<{ mimeType?: string | null; body?: { data?: string | null } }>;
  };
}): GmailMessageLite {
  const headers = msg.payload?.headers ?? [];
  const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value ?? '';
  const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value ?? '';
  let bodyText = decodeBody(msg.payload?.body?.data);
  if (!bodyText && msg.payload?.parts) {
    bodyText = msg.payload.parts
      .filter((p) => p.mimeType === 'text/plain')
      .map((p) => decodeBody(p.body?.data))
      .join('\n');
  }
  return {
    id: msg.id ?? '',
    subject,
    from,
    snippet: msg.snippet ?? '',
    bodyText: bodyText || msg.snippet || '',
    receivedAt: msg.internalDate ? new Date(Number(msg.internalDate)).toISOString() : new Date().toISOString(),
  };
}

export async function runGmailSync(uid: string, accountId: string, geminiKey?: string) {
  const accountRef = db.doc(`users/${uid}/gmail_accounts/${accountId}`);
  const accountSnap = await accountRef.get();
  if (!accountSnap.exists) throw new Error('Gmail account not found');

  const account = accountSnap.data() as { refreshTokenEnc?: string; email?: string };
  if (!account.refreshTokenEnc) throw new Error('Missing refresh token');

  await accountRef.set({ status: 'syncing' }, { merge: true });

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    await accountRef.set({ status: 'error' }, { merge: true });
    throw new Error('Gmail OAuth not configured on server');
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  const token = account.refreshTokenEnc;
  if (token.startsWith('ya29.') || token.startsWith('ya.a')) {
    oauth2.setCredentials({ access_token: token });
  } else {
    oauth2.setCredentials({ refresh_token: token });
  }
  const gmail = google.gmail({ version: 'v1', auth: oauth2 });

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: GMAIL_QUERY,
    maxResults: 500,
  });

  const messageIds = listRes.data.messages?.map((m) => m.id).filter(Boolean) ?? [];
  let parsedCount = 0;

  for (const messageId of messageIds) {
    const full = await gmail.users.messages.get({ userId: 'me', id: messageId!, format: 'full' });
    const lite = toMessageLite(full.data);
    const parsed = await parseMessage(lite, geminiKey);
    if (!parsed?.result.isSubscription) continue;

    parsedCount += 1;
    const subId = parsed.result.merchant.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await db.doc(`users/${uid}/subscriptions/${subId}`).set(
      {
        merchant: parsed.result.merchant,
        amountOrig: parsed.result.amount,
        currency: parsed.result.currency ?? 'USD',
        cycle: parsed.result.cadence ?? 'monthly',
        category: parsed.result.category,
        account: accountId,
        status: 'active',
        verdict: 'review',
        evidence: [parsed.result.notes ?? 'Parsed from Gmail receipt'],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await db.doc(`users/${uid}/receipts/${messageId}`).set({
      gmailAccountId: accountId,
      gmailMessageId: messageId,
      subId,
      subject: lite.subject,
      fromAddr: lite.from,
      receivedAt: admin.firestore.Timestamp.fromDate(new Date(lite.receivedAt)),
      amountRaw: String(parsed.result.amount),
      parsedJson: parsed.result,
      parserUsed: parsed.parserUsed,
      confidence: parsed.result.confidence,
    });
  }

  await accountRef.set(
    {
      status: 'synced',
      lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { scanned: messageIds.length, parsed: parsedCount };
}
