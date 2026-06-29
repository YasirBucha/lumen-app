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

/** First sync cap — keeps callable under client + function deadlines. */
const INITIAL_SYNC_MAX = 150;
const FETCH_BATCH = 12;

function matchesAnyParser(msg: GmailMessageLite): boolean {
  return PARSERS.some((p) => p.matches(msg));
}

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fn));
    out.push(...results);
  }
  return out;
}

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

const FX = 278;

const CATEGORY_MAP: Record<string, string> = {
  streaming: 'streaming',
  software: 'productivity',
  productivity: 'productivity',
  cloud: 'cloud',
  education: 'school',
  school: 'school',
  shopping: 'ecommerce',
  ecommerce: 'ecommerce',
  bills: 'bills',
  other: 'bills',
};

function glyphColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360} 45% 42%)`;
}

function toAmounts(amount: number, currency: string | null) {
  const ccy = currency ?? 'USD';
  const amountPKR = ccy === 'PKR' ? amount : Math.round(amount * FX);
  const amountUSD = ccy === 'USD' ? amount : amount / FX;
  return { amountPKR, amountUSD, currency: ccy };
}

export async function runGmailSync(
  uid: string,
  accountId: string,
  geminiKey?: string,
  inlineAccessToken?: string,
) {
  const accountRef = db.doc(`users/${uid}/gmail_accounts/${accountId}`);
  const accountSnap = await accountRef.get();
  if (!accountSnap.exists) throw new Error('Gmail account not found');

  const account = accountSnap.data() as {
    refreshTokenEnc?: string;
    tokenKind?: string;
    email?: string;
  };

  const storedToken = account.refreshTokenEnc;
  const token = inlineAccessToken ?? storedToken;
  if (!token) throw new Error('Missing Gmail token — connect Gmail again');

  await accountRef.set({ status: 'syncing' }, { merge: true });

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    await accountRef.set({ status: 'error' }, { merge: true });
    throw new Error('Gmail OAuth not configured on server');
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  const isAccessToken =
    Boolean(inlineAccessToken) ||
    account.tokenKind === 'access' ||
    token.startsWith('ya29.') ||
    token.startsWith('ya.a');

  if (isAccessToken) {
    oauth2.setCredentials({ access_token: token });
  } else if (token.startsWith('1//')) {
    oauth2.setCredentials({ refresh_token: token });
  } else {
    await accountRef.set({ status: 'error' }, { merge: true });
    throw new Error('Invalid stored Gmail token. Connect Gmail again.');
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });

  let listRes;
  try {
    listRes = await gmail.users.messages.list({
      userId: 'me',
      q: GMAIL_QUERY,
      maxResults: INITIAL_SYNC_MAX,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await accountRef.set({ status: 'error' }, { merge: true });
    if (msg.includes('invalid_grant')) {
      throw new Error('invalid_grant: Gmail token rejected. Connect Gmail again and approve access.');
    }
    throw err;
  }

  const messageIds = listRes.data.messages?.map((m) => m.id).filter(Boolean) as string[];
  let parsedCount = 0;

  const metaMessages = await mapInBatches(messageIds, FETCH_BATCH, async (messageId) => {
    const meta = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'metadata',
      metadataHeaders: ['Subject', 'From'],
    });
    return toMessageLite(meta.data);
  });

  const candidates = metaMessages.filter(matchesAnyParser);
  const fullMessages = await mapInBatches(candidates, FETCH_BATCH, async (lite) => {
    const full = await gmail.users.messages.get({ userId: 'me', id: lite.id, format: 'full' });
    return toMessageLite(full.data);
  });

  for (const lite of fullMessages) {
    const parsed = await parseMessage(lite, geminiKey);
    if (!parsed?.result.isSubscription) continue;

    parsedCount += 1;
    const subId = parsed.result.merchant.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { amountPKR, amountUSD, currency } = toAmounts(parsed.result.amount, parsed.result.currency);
    const merchant = parsed.result.merchant;
    const cycle = parsed.result.cadence === 'yearly' ? 'yearly' : 'monthly';
    const now = new Date();
    const nextCharge = new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().slice(0, 10);

    await db.doc(`users/${uid}/subscriptions/${subId}`).set(
      {
        merchant,
        glyph: merchant.charAt(0).toUpperCase(),
        glyphBg: glyphColor(merchant),
        amountOrig: parsed.result.amount,
        amountPKR,
        amountUSD,
        currency,
        cycle,
        category: CATEGORY_MAP[parsed.result.category] ?? 'bills',
        account: accountId,
        card: 'visa',
        last4: '0000',
        nextCharge,
        since: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        status: 'active',
        verdict: 'review',
        evidence: [parsed.result.notes ?? 'Parsed from Gmail receipt'],
        usage: { sessionsLast30: 0, lastUsed: 'Unknown' },
        history: [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await db.doc(`users/${uid}/receipts/${lite.id}`).set({
      gmailAccountId: accountId,
      gmailMessageId: lite.id,
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
