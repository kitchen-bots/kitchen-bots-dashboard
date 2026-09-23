# Kitchen Bots API Worker

Hono-based Cloudflare Worker implementing the Phase 01 backend
(docs/phases/01-firebase-worker-and-security.md, docs/MASTER_PLAN.md).

## Layout

```
worker/
  src/
    index.ts            Hono app: /v1 routes, middleware chain
    env.ts              Typed bindings/secrets
    middleware.ts       Request context, CORS, body limit, auth, roles, errors
    schemas/            Canonical Zod schemas for every Firestore collection
      primitives.ts     Money (integer paise INR), timestamps, R2 keys, addresses, roles
      identity.ts       users, organizations, memberships
      catalog.ts        categories, products, public projection, content
      commerce.ts       enquiries, quotes, orders + transition maps
      documents.ts      private document records
      platform.ts       auditEvents, mailOutbox, idempotencyKeys
      api.ts            Request-body contracts for each endpoint
    lib/                firestore REST client, Firebase token verification,
                        Turnstile, service-account auth, money math, crypto
    routes/             health, catalog, enquiries, orders, documents, admin
    services/           audit + mail outbox writers, idempotency store
  test/                 Vitest suite (schemas, money, routes)
  wrangler.jsonc        Worker config with R2 bindings and env split
```

## API surface (implemented)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /v1/health | none | Liveness |
| GET | /v1/catalog/products | none | Published public fields only, cursor pagination (max 50) |
| GET | /v1/catalog/products/:slug | none | 404 when unpublished/missing |
| GET | /v1/catalog/categories | none | Published categories |
| POST | /v1/enquiries | Turnstile | Public intake; audit + mailOutbox written atomically |
| POST | /v1/enquiries/:id/claim | Firebase | Staff claim, or customer claim with verified email match |
| PATCH | /v1/enquiries/:id/status | operations/admin | Enforced transition map |
| POST | /v1/orders | Firebase | Recomputes totals from Firestore; idempotent; quote-only and unpublished products rejected |
| GET | /v1/orders/:id | owner or staff | |
| PATCH | /v1/orders/:id/status | operations/admin | Enforced transition map (pending -> confirmed -> ... ) |
| POST | /v1/documents | operations/admin | Upload to PRIVATE_DOCUMENTS with non-guessable keys |
| GET | /v1/documents/:id/access | owner/org/staff | Streams the private object after authorization |
| POST | /v1/admin/staff-claims | admin | Sets/revokes custom claims; last-admin protected |
| GET/POST | /v1/staff/products | editor+ | Staff catalog list/create (CMS) |
| GET/PATCH/DELETE | /v1/staff/products/:id | editor+ | Staff product read/update/delete |
| GET/POST | /v1/staff/categories, /v1/staff/content | editor+ | CMS categories and content list/create |
| GET/PATCH | /v1/staff/enquiries(/:id/status) | editor+ | CRM enquiry list, read, status change |
| GET/DELETE | /v1/staff/orders(/:id) | editor+ | Staff order list/read/delete |
| GET/POST | /v1/staff/quotes | editor+ | Quote list; create recomputes totals server-side |
| GET/PATCH | /v1/staff/quotes/:id/status | editor+ | Enforced quote transitions; send enqueues customer email |
| GET/DELETE | /v1/staff/documents(/:id) | editor+ | Document records; delete removes the R2 object too |
| GET | /v1/staff/kpis | editor+ | Order/enquiry/quote counts and non-cancelled revenue |

Errors always use `{ code, message, requestId, fieldErrors? }`.
Mutating endpoints require an `Idempotency-Key` header (8-128 chars); a
replayed key returns the stored response, a reused key with a different body
returns 409.

## Local development

```bash
# Worker API on :8787 (uses worker/.dev.vars)
npm run dev:worker

# Worker unit tests
npm run test:worker

# Firestore rules tests (boots an ephemeral emulator on :8081; needs Java)
npm run test:rules
```

Copy `worker/.dev.vars.example` to `worker/.dev.vars` for local secrets. The
Turnstile test secret always passes so public intake is testable end to end.

## Deployment

```bash
npm run deploy:worker        # typecheck + wrangler deploy (config: worker/wrangler.jsonc)
wrangler secret put FIREBASE_PRIVATE_KEY   # etc.
```

Secrets: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY,
TURNSTILE_SECRET_KEY, RESEND_API_KEY. R2 buckets PUBLIC_MEDIA and
PRIVATE_DOCUMENTS must exist before deploy.

## What Phase 01 does not yet include

- Firebase emulator-based Auth provider wiring in the frontend (Phase 02
  providers replace the mock auth service).
- A scheduled mailOutbox drain via Resend (outbox schema and producers are
  live; the cron consumer is Phase 03).
- Rate limiting middleware (schema/storage hooks exist; enforcement lands
  with the Phase 02 hardening pass).
- Transactional Firestore writes across collections are wired through
  runTransaction where used; multi-step flows currently use sequential
  writes and are marked for the Phase 02 atomicity pass.
