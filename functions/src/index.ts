import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import { runGmailSync } from './gmailSync';

setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

export const gmailInitialSync = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const accountId = request.data?.accountId as string | undefined;
  if (!accountId) throw new HttpsError('invalid-argument', 'accountId required');

  const geminiKey = request.data?.geminiKey as string | undefined;
  const result = await runGmailSync(uid, accountId, geminiKey);
  return result;
});

export const gmailIncrementalSync = onSchedule('every 6 hours', async () => {
  // Phase 2 stub: iterate connected accounts and sync deltas.
  // Full incremental historyId tracking lands in a follow-up pass.
});
