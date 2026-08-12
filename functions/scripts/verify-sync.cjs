#!/usr/bin/env node
/** Backend smoke check: node functions/scripts/verify-sync.cjs [uid] [accountId] */
const admin = require('firebase-admin');

const projectId = process.env.GCLOUD_PROJECT || 'lumen-20260630';
const uid = process.argv[2] || 'RgO3OC7yLbg4adDazuqxVvwQuQU2';
const accountId = process.argv[3] || 'yasirbucha';

admin.initializeApp({ projectId });
const db = admin.firestore();

(async () => {
  const accountSnap = await db.doc(`users/${uid}/gmail_accounts/${accountId}`).get();
  if (!accountSnap.exists) {
    console.error('FAIL: gmail account missing');
    process.exit(1);
  }
  const account = accountSnap.data();
  const subsSnap = await db.collection(`users/${uid}/subscriptions`).where('account', '==', accountId).get();

  const hasPublicToken = Boolean(account.refreshTokenEnc || account.accessToken);
  console.log('gmail:', { email: account.email, status: account.status, hasPublicToken });
  console.log('subs:', subsSnap.size, subsSnap.docs.map((d) => d.data().merchant));

  if (hasPublicToken) {
    console.error('FAIL: Gmail token is client-readable');
    process.exit(2);
  }
  if (account.status !== 'synced' || subsSnap.size === 0) process.exit(2);
  console.log('PASS');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
