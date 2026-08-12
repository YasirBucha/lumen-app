import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import { runGmailSync, runIncrementalSyncForAllAccounts } from './gmailSync';
import { gmailClientId, gmailClientSecret, gmailOAuthCallback, gmailOAuthStart } from './gmailOAuth';

export { gmailOAuthCallback, gmailOAuthStart };

setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

export const gmailInitialSync = onCall(
  { secrets: [gmailClientId, gmailClientSecret], timeoutSeconds: 540, memory: '512MiB' },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

    const accountId = request.data?.accountId as string | undefined;
    if (!accountId || !/^[A-Za-z0-9_-]{1,128}$/.test(accountId)) {
      throw new HttpsError('invalid-argument', 'Valid accountId required');
    }

    const rawAccessToken = request.data?.accessToken;
    if (rawAccessToken != null && (typeof rawAccessToken !== 'string' || rawAccessToken.length > 4096)) {
      throw new HttpsError('invalid-argument', 'Invalid access token');
    }
    const accessToken = typeof rawAccessToken === 'string' ? rawAccessToken : undefined;
    const incremental = request.data?.incremental === true;

    try {
      const result = await runGmailSync(uid, accountId, undefined, accessToken, {
        mode: incremental ? 'incremental' : 'full',
      });
      console.log('gmailInitialSync ok', { uid, accountId, ...result });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gmail sync failed';
      console.error('gmailInitialSync error', { uid, accountId, message });
      if (message.includes('invalid_grant')) {
        throw new HttpsError('permission-denied', 'Gmail authorization expired. Connect Gmail again.');
      }
      throw new HttpsError('internal', 'Gmail sync failed. Try again.');
    }
  },
);

export const gmailIncrementalSync = onSchedule(
  {
    schedule: 'every 6 hours',
    secrets: [gmailClientId, gmailClientSecret],
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async () => {
    await runIncrementalSyncForAllAccounts();
  },
);
