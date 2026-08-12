#!/usr/bin/env node
/** Server-side re-sync: node functions/scripts/run-sync.cjs [uid] [accountId] */
const { runGmailSync } = require('../lib/gmailSync');

const projectId = process.env.GCLOUD_PROJECT || 'lumen-20260630';
const uid = process.argv[2] || 'RgO3OC7yLbg4adDazuqxVvwQuQU2';
const accountId = process.argv[3] || 'yasirbucha';

if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
  console.error('Need GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET');
  process.exit(1);
}

runGmailSync(uid, accountId)
  .then((r) => {
    console.log('SYNC OK', r);
  })
  .catch((e) => {
    console.error('SYNC FAIL', e.message);
    process.exit(1);
  });
