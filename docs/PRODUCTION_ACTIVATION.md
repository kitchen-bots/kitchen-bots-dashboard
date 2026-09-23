# Production Activation Checklist

Ordered steps to take the Phase 01/02 backend from merged code to a live
system. Nothing here is automated on purpose — each step touches a real
environment. Do not skip the ordering notes.

## 0. Prerequisites

- [ ] Cloudflare account with Workers + R2 enabled
- [ ] Firebase project created (separate **dev** and **prod** projects are
      strongly recommended; `kitchen-bots` is currently referenced in configs)
- [ ] `firebase-tools` installed and `npx firebase login` completed
- [ ] `wrangler` authenticated (`npx wrangler login`)

## 1. Firebase Auth providers

Console path: **Authentication → Sign-in method**. Enable:

- [ ] **Email/Password** (registration + login + password reset)
- [ ] **Google** (popup sign-in)
- [ ] **Authorization → Settings**: add every dashboard domain under
      *Authorized domains* (localhost, dashboard.kitchenbots.in, staging)

Roles are **not** configured here. They are custom claims set by the Worker
(see step 5). Never trust a Firestore profile field for authorization.

## 2. Firebase service-account secrets (Worker)

```bash
# One-time: create a service account with "Firebase Admin" (or stricter:
# "Firebase Rules System" + "Service Account Token Creator") and download JSON.
npx wrangler secret put FIREBASE_PROJECT_ID        # e.g. kitchen-bots
npx wrangler secret put FIREBASE_CLIENT_EMAIL      # ...@kitchen-bots.iam.gserviceaccount.com
npx wrangler secret put FIREBASE_PRIVATE_KEY       # paste the PEM including BEGIN/END lines
```

- [ ] Do for **both** the default (prod) and `--env staging` worker, if used
- [ ] Verify the private key newlines survive: the Worker decodes `\n` escapes
- [ ] Rotate/delete the downloaded JSON from your local disk afterwards

## 3. Turnstile secret

- [ ] Create a Turnstile widget in the Cloudflare dashboard (managed mode)
- [ ] `npx wrangler secret put TURNSTILE_SECRET_KEY` (worker)
- [ ] Public site key goes in `VITE_TURNSTILE_SITE_KEY` for the storefront
- [ ] Local dev can keep the always-pass test secret from
      `worker/.dev.vars.example`

## 4. R2 buckets and Wrangler bindings

Bucket names in `worker/wrangler.jsonc`:
`kitchen-bots-media` (public assets) and `kitchen-bots-private-documents`
(private PDFs; never expose this bucket publicly).

```bash
npx wrangler r2 bucket create kitchen-bots-media
npx wrangler r2 bucket create kitchen-bots-private-documents
# staging variant if used:
npx wrangler r2 bucket create kitchen-bots-private-documents-staging
```

- [ ] Confirm `wrangler.jsonc` binding names (`PUBLIC_MEDIA`,
      `PRIVATE_DOCUMENTS`) match this file — they are referenced by code
- [ ] No public custom domain on the private bucket

## 5. First admin bootstrap (chicken-and-egg)

The role claim API `POST /v1/admin/staff-claims` requires an existing admin,
so bootstrap the first one by hand, exactly once:

```bash
# 1. Sign up the intended admin through the dashboard UI (or Firebase
#    Console → Authentication → Add user), verify the email.
# 2. Mint a token with that account:
#    firebase auth:print-custom-claims --project <id>   # informational
# 3. Set the claim directly in the console (run this in the GCP console /
#    Cloud Shell with the Admin SDK):
node -e "require('firebase-admin').initializeApp();require('firebase-admin').auth().setCustomUserClaims('<UID>', { role: 'admin' }).then(() => process.exit(0))"
# 4. The user signs out and back in (claims propagate into new ID tokens).
```

- [ ] `scripts/bootstrap-admin.mjs` documents an interactive variant
- [ ] After the first admin exists, use the Worker API for all further staff
      claims (last-admin protection applies there)

## 6. Catalog seed

Firestore must contain published `products/` and `categories/` docs before
the public catalog endpoints return anything. Two options:

- **Emulator round-trip (recommended)**: build the catalog in the local
  emulator, then export/import to prod with
  `firebase firestore:export`/`import` or `gcloud firestore export`.
- **Console/REST**: create documents directly. Required fields per product:
  `slug`, `name`, `publicationState: 'published'`, `salesMode`,
  `priceMinor`/pricing fields, `updatedAt`.

- [ ] `npm run seed:emulator` seeds a small starter catalog into the local
      emulator (also a schema reference for hand-seeding)
- [ ] Categories published before products that reference them
- [ ] Spot-check `GET /v1/catalog/products` after the Worker deploy

## 7. CORS origins

`worker/wrangler.jsonc` → `vars.ALLOWED_ORIGINS`:

- [ ] Production list currently:
      `https://kitchenbots.in, https://www.kitchenbots.in, https://dashboard.kitchenbots.in`
      plus the two localhost dev ports
- [ ] Add/adjust any additional storefront/dashboard origins **before**
      deploy; changes require redeploy
- [ ] Keep localhost entries only because the same config serves dev; if you
      split configs per environment, drop them from prod

## 8. Deploy the Worker

```bash
npm run deploy:worker     # typecheck + wrangler deploy (worker/wrangler.jsonc)
```

- [ ] `GET https://<worker-host>/v1/health` returns ok
- [ ] `GET /v1/catalog/products` returns seeded items (or empty list, not 500)
- [ ] Storefront POST /v1/enquiries works with the production Turnstile key
- [ ] Firestore rules deployed: `npx firebase deploy --only firestore:rules,firestore:indexes`
- [ ] Emulator rules suite still passes: `npm run test:rules`

## 9. Email delivery (Resend)

Phase 01 wrote `mailOutbox` documents; a Phase 03 cron drains them.

- [ ] `npx wrangler secret put RESEND_API_KEY`
- [ ] Verify the sending domain in Resend before go-live (SPF/DKIM)
- [ ] Until the cron ships, drain manually or accept the outbox as backlog —
      business writes never depended on email delivery

## Go-live sign-off

- [ ] All secret steps completed on prod worker (FIREBASE_*, TURNSTILE_*, RESEND_*)
- [ ] Rules deployed and deny-all fallback verified
- [ ] First admin can log in, sees /admin, can mint staff claims via API
- [ ] A real order round-trip: enquiry → quote/order → status transition
