# Lumen — Setup for Yasir (one-time)

**Updated:** 2026-06-30

---

## Already done (agent / CLI)

- Blaze plan active
- Cloud Functions deployed (`gmailInitialSync`, `gmailIncrementalSync`) — `asia-south1`
- Gmail OAuth secrets in Secret Manager (from Firebase Google sign-in)
- Gmail API enabled
- Hosting: https://lumen-20260630.web.app
- Local dev: `npm run dev`

## Optional one click (Gmail connect)

If Connect Gmail fails with a scope/consent error:

https://console.cloud.google.com/apis/credentials/consent?project=lumen-20260630

Add scope **`gmail.readonly`** and your Gmail as a **test user** (app in Testing mode).

```bash
cd /Users/yb/Dev/projects/Lumen
npm run dev
```

Sign in → seed data fills the UI. Gmail sync works only after steps 1–4.

---

## Quick links

| What | URL |
|------|-----|
| Project overview | https://console.firebase.google.com/project/lumen-20260630/overview |
| Live app | https://lumen-20260630.web.app |
| Blaze billing | https://console.firebase.google.com/project/lumen-20260630/usage/details |
| Authentication | https://console.firebase.google.com/project/lumen-20260630/authentication/providers |
| Firestore | https://console.firebase.google.com/project/lumen-20260630/firestore |
| GCP APIs | https://console.cloud.google.com/apis/dashboard?project=lumen-20260630 |
