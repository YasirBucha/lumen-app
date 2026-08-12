import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import {
  buildSubscriptionsFromEvents,
  isBillingLike,
  processEmailToReceiptEvent,
} from './parsers';
import type { BuiltSubscription } from './parsers/merge';
import type { GmailMessageLite, ReceiptEvent } from './parsers/types';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const GMAIL_QUERIES = [
  'from:(billing OR receipts OR renewal OR invoice OR no-reply) newer_than:5y',
  'from:(stripe.com OR paypal.com OR apple.com OR google.com OR pay.google.com) newer_than:5y',
  'subject:(subscription OR invoice OR receipt OR renewal) newer_than:5y',
];

const SYNC_PAGE_SIZE = 100;
const SYNC_MAX_MESSAGES = 800;
const ACCOUNT_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export type SyncMode = 'full' | 'incremental';

export interface SyncOptions {
  mode?: SyncMode;
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
      .filter((p) => p.mimeType === 'text/plain' || p.mimeType === 'text/html')
      .map((p) => decodeBody(p.body?.data))
      .join('\n');
  }
  return {
    id: msg.id ?? '',
    subject,
    from,
    snippet: msg.snippet ?? '',
    bodyText: bodyText || msg.snippet || '',
    receivedAt: msg.internalDate
      ? new Date(Number(msg.internalDate)).toISOString()
      : new Date().toISOString(),
  };
}

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    out.push(...(await Promise.all(batch.map(fn))));
  }
  return out;
}

type GmailClient = ReturnType<typeof google.gmail>;

function assertAccountId(accountId: string): void {
  if (!ACCOUNT_ID_RE.test(accountId)) throw new Error('Invalid Gmail account id');
}

function tokenRef(uid: string, accountId: string) {
  return db.doc(`users/${uid}/gmail_account_tokens/${accountId}`);
}

async function listFullBillingMessageIds(gmail: GmailClient): Promise<string[]> {
  const seen = new Set<string>();
  for (const q of GMAIL_QUERIES) {
    let pageToken: string | undefined;
    do {
      const res = await gmail.users.messages.list({
        userId: 'me',
        q,
        maxResults: SYNC_PAGE_SIZE,
        pageToken,
      });
      for (const m of res.data.messages ?? []) {
        if (m.id) seen.add(m.id);
        if (seen.size >= SYNC_MAX_MESSAGES) break;
      }
      if (seen.size >= SYNC_MAX_MESSAGES) break;
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
    if (seen.size >= SYNC_MAX_MESSAGES) break;
  }
  return [...seen].slice(0, SYNC_MAX_MESSAGES);
}

async function listIncrementalMessageIds(
  gmail: GmailClient,
  startHistoryId: string,
): Promise<{ messageIds: string[]; historyId: string | null; expired: boolean }> {
  const seen = new Set<string>();
  let pageToken: string | undefined;
  let latestHistoryId: string | null = null;

  try {
    do {
      const res = await gmail.users.history.list({
        userId: 'me',
        startHistoryId,
        historyTypes: ['messageAdded'],
        pageToken,
      });
      latestHistoryId = res.data.historyId ?? latestHistoryId;
      for (const h of res.data.history ?? []) {
        for (const added of h.messagesAdded ?? []) {
          if (added.message?.id) seen.add(added.message.id);
        }
      }
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('404') || msg.includes('historyId')) {
      return { messageIds: [], historyId: null, expired: true };
    }
    throw err;
  }

  return { messageIds: [...seen], historyId: latestHistoryId, expired: false };
}

async function loadGeminiKey(uid: string): Promise<string | undefined> {
  const snap = await db.collection(`users/${uid}/preferences`).limit(1).get();
  if (snap.empty) return undefined;
  const key = snap.docs[0].data()?.geminiApiKey as string | undefined;
  return key?.trim() || undefined;
}

async function saveReceipt(uid: string, accountId: string, event: ReceiptEvent): Promise<void> {
  await db.doc(`users/${uid}/receipts/${event.gmailMessageId}`).set(
    {
      gmailAccountId: accountId,
      gmailMessageId: event.gmailMessageId,
      subId: event.merchant ? event.merchant.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
      subject: event.subject,
      fromAddr: event.fromAddr,
      receivedAt: admin.firestore.Timestamp.fromDate(new Date(event.receivedAt)),
      amountRaw: event.amountRaw ?? '',
      parsedJson: event,
      parserUsed: event.parserSource,
      confidence: event.confidence,
      classification: event.classification,
      rejectionReason: event.rejectionReason,
    },
    { merge: true },
  );
}

async function sendPriceIncreaseNotifications(uid: string, built: BuiltSubscription[]): Promise<void> {
  const priceChanges = built.filter((entry) => entry.doc.priceIncrease);
  if (priceChanges.length === 0) return;

  try {
    const tokenSnap = await db.collection(`users/${uid}/notification_tokens`).get();
    const tokenEntries = tokenSnap.docs
      .map((tokenDoc) => ({ token: tokenDoc.data().token, ref: tokenDoc.ref }))
      .filter((entry): entry is { token: string; ref: FirebaseFirestore.DocumentReference } => typeof entry.token === 'string' && entry.token.length > 0);
    if (tokenEntries.length === 0) return;
    const tokens = tokenEntries.map((entry) => entry.token);

    for (const entry of priceChanges) {
      const increase = entry.doc.priceIncrease as Record<string, unknown>;
      const eventId = `${entry.subId}-${String(increase.date)}-${String(increase.toPKR)}`.replace(/[^A-Za-z0-9_-]/g, '_');
      const eventRef = db.doc(`users/${uid}/notification_events/${eventId}`);
      try {
        await eventRef.create({ subId: entry.subId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      } catch (error) {
        const code = (error as { code?: number | string }).code;
        if (code === 6 || code === 'already-exists') continue;
        throw error;
      }

      for (let i = 0; i < tokens.length; i += 500) {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: tokens.slice(i, i + 500),
          notification: {
            title: `${String(entry.doc.merchant)} price changed`,
            body: `Your renewal moved from Rs ${String(increase.fromPKR)} to Rs ${String(increase.toPKR)}.`,
          },
          data: { route: '/alerts', subId: entry.subId },
        });
        const stale = response.responses
          .map((result, index) => (result.success ? null : tokenEntries[i + index]?.ref))
          .filter((ref): ref is FirebaseFirestore.DocumentReference => Boolean(ref));
        await Promise.all(stale.map((ref) => ref.delete()));
      }
    }
  } catch (error) {
    console.error('price increase notification failed', {
      uid,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function rebuildSubscriptions(uid: string, accountId: string): Promise<number> {
  const snap = await db
    .collection(`users/${uid}/receipts`)
    .where('gmailAccountId', '==', accountId)
    .get();

  const events: ReceiptEvent[] = [];
  for (const doc of snap.docs) {
    const parsed = doc.data().parsedJson as ReceiptEvent | undefined;
    if (parsed?.gmailMessageId) events.push(parsed);
  }

  const built = buildSubscriptionsFromEvents(events, accountId);
  const activeIds = new Set(built.map((b) => b.subId));

  for (const { subId, doc: subDoc } of built) {
    await db.doc(`users/${uid}/subscriptions/${subId}`).set(
      { ...subDoc, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    );
  }

  const existing = await db
    .collection(`users/${uid}/subscriptions`)
    .where('account', '==', accountId)
    .get();
  for (const doc of existing.docs) {
    if (!activeIds.has(doc.id)) {
      await doc.ref.set(
        { status: 'past', updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true },
      );
    }
  }

  await sendPriceIncreaseNotifications(uid, built);

  return built.length;
}

async function processMessageIds(
  gmail: GmailClient,
  uid: string,
  accountId: string,
  messageIds: string[],
  geminiKey?: string,
  onProgress?: (processed: number, parsed: number) => Promise<void>,
): Promise<number> {
  if (messageIds.length === 0) return 0;

  const metaMessages = await mapInBatches(messageIds, 12, async (messageId) => {
    const meta = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'metadata',
      metadataHeaders: ['Subject', 'From'],
    });
    return toMessageLite(meta.data);
  });

  const candidates = metaMessages.filter(isBillingLike);
  const fullMessages = await mapInBatches(candidates, 10, async (lite) => {
    const full = await gmail.users.messages.get({ userId: 'me', id: lite.id, format: 'full' });
    return toMessageLite(full.data);
  });

  let parsedEvents = 0;
  for (let i = 0; i < fullMessages.length; i += 1) {
    const msg = fullMessages[i];
    const event = await processEmailToReceiptEvent(msg, geminiKey);
    await saveReceipt(uid, accountId, event);
    if (event.classification !== 'not_subscription' && event.rejectionReason === null && event.merchant) {
      parsedEvents += 1;
    }
    if (onProgress && ((i + 1) % 10 === 0 || i === fullMessages.length - 1)) {
      await onProgress(i + 1, parsedEvents);
    }
  }
  return parsedEvents;
}

function createOAuthClient(token: string, inlineAccessToken?: string, tokenKind?: string) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Gmail OAuth not configured on server');

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  const isAccessToken =
    Boolean(inlineAccessToken) ||
    tokenKind === 'access' ||
    token.startsWith('ya29.') ||
    token.startsWith('ya.a');

  if (isAccessToken) {
    oauth2.setCredentials({ access_token: inlineAccessToken ?? token });
  } else if (tokenKind === 'refresh' || token.startsWith('1//')) {
    oauth2.setCredentials({ refresh_token: token });
  } else {
    throw new Error('Invalid stored Gmail token. Connect Gmail again.');
  }
  return oauth2;
}

export async function runGmailSync(
  uid: string,
  accountId: string,
  geminiKey?: string,
  inlineAccessToken?: string,
  options: SyncOptions = {},
) {
  assertAccountId(accountId);
  const accountRef = db.doc(`users/${uid}/gmail_accounts/${accountId}`);
  const accountSnap = await accountRef.get();
  if (!accountSnap.exists) throw new Error('Gmail account not found');

  const account = accountSnap.data() as {
    historyId?: string;
  };

  const tokenSnap = await tokenRef(uid, accountId).get();
  const tokenData = tokenSnap.data() as { token?: string; tokenKind?: string } | undefined;
  const storedToken = tokenData?.token;
  const token = inlineAccessToken ?? storedToken;
  if (!token) throw new Error('Missing Gmail token — connect Gmail again');

  await accountRef.set(
    { status: 'syncing', syncTotal: 0, syncProcessed: 0, syncParsed: 0 },
    { merge: true },
  );

  let oauth2;
  try {
    oauth2 = createOAuthClient(token, inlineAccessToken, tokenData?.tokenKind);
  } catch (err) {
    await accountRef.set({ status: 'error' }, { merge: true });
    throw err;
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });
  const resolvedGeminiKey = geminiKey ?? (await loadGeminiKey(uid));
  const mode = options.mode ?? 'full';

  let messageIds: string[] = [];
  let syncMode: SyncMode = mode;

  try {
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const currentHistoryId = profile.data.historyId ?? null;

    if (mode === 'incremental' && account.historyId) {
      const inc = await listIncrementalMessageIds(gmail, account.historyId);
      if (inc.expired) {
        syncMode = 'full';
        messageIds = await listFullBillingMessageIds(gmail);
    } else {
      messageIds = inc.messageIds;
      }
    } else {
      messageIds = await listFullBillingMessageIds(gmail);
    }

    await accountRef.set(
      { syncTotal: messageIds.length, syncProcessed: 0, syncParsed: 0 },
      { merge: true },
    );

    const parsedEvents = await processMessageIds(
      gmail,
      uid,
      accountId,
      messageIds,
      resolvedGeminiKey,
      async (syncProcessed, syncParsed) => {
        await accountRef.set({ syncProcessed, syncParsed }, { merge: true });
      },
    );
    const subscriptionCount = await rebuildSubscriptions(uid, accountId);

    await accountRef.set(
      {
        status: 'synced',
        lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        historyId: currentHistoryId ?? account.historyId ?? null,
        lastSyncMode: syncMode,
      },
      { merge: true },
    );

    return {
      scanned: messageIds.length,
      parsed: parsedEvents,
      subscriptions: subscriptionCount,
      mode: syncMode,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await accountRef.set({ status: 'error' }, { merge: true });
    if (msg.includes('invalid_grant')) {
      throw new Error('invalid_grant: Gmail token rejected. Connect Gmail again and approve access.');
    }
    throw err;
  }
}

/** Incremental sync for all connected mailboxes — used by scheduled job. */
export async function runIncrementalSyncForAllAccounts(): Promise<void> {
  const snap = await db.collectionGroup('gmail_accounts').where('status', 'in', ['synced', 'error']).get();

  for (const doc of snap.docs) {
    const uid = doc.ref.parent.parent?.id;
    if (!uid) continue;
    const accountId = doc.id;
    try {
      const tokenSnap = await tokenRef(uid, accountId).get();
      const tokenData = tokenSnap.data() as { token?: string; tokenKind?: string } | undefined;
      if (!tokenData?.token || tokenData.tokenKind !== 'refresh') {
        console.warn('incremental sync skipped: no refresh token', { uid, accountId });
        continue;
      }
      await runGmailSync(uid, accountId, undefined, undefined, { mode: 'incremental' });
      console.log('incremental sync ok', { uid, accountId });
    } catch (err) {
      console.error('incremental sync fail', {
        uid,
        accountId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
