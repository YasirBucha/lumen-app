import { defineSecret } from 'firebase-functions/params';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import { runGmailSync } from './gmailSync';

const gmailClientId = defineSecret('GMAIL_CLIENT_ID');
const gmailClientSecret = defineSecret('GMAIL_CLIENT_SECRET');

setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

export const gmailInitialSync = onCall(
  { secrets: [gmailClientId, gmailClientSecret], timeoutSeconds: 540, memory: '512MiB' },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

    const accountId = request.data?.accountId as string | undefined;
    if (!accountId) throw new HttpsError('invalid-argument', 'accountId required');

    const accessToken = request.data?.accessToken as string | undefined;
    const geminiKey = request.data?.geminiKey as string | undefined;

    try {
      const result = await runGmailSync(uid, accountId, geminiKey, accessToken);
      console.log('gmailInitialSync ok', { uid, accountId, ...result });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gmail sync failed';
      console.error('gmailInitialSync error', { uid, accountId, message });
      throw new HttpsError('internal', message);
    }
  },
);

export const gmailIncrementalSync = onSchedule('every 6 hours', async () => {
  // Phase 2 stub: iterate connected accounts and sync deltas.
  // Full incremental historyId tracking lands in a follow-up pass.
});
