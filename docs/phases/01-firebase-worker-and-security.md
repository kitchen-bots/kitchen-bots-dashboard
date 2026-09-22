# Dashboard Phase 01: Firebase, Worker, and Security Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build the canonical schemas, Firebase environments, Firestore Rules, Worker API, R2 boundaries, and abuse protection required by both applications.

**Architecture:** Firebase Auth and Firestore provide identity and data. A Hono Worker handles public submissions, authoritative calculations, role management, private files, email orchestration, and later payments.

**Tech Stack:** Firebase Auth, Cloud Firestore, Firebase Emulator Suite, Hono, Zod, Cloudflare Workers, R2, Turnstile, Vitest.

---

## Status

**Updated on 2026-09-22. Phase 01 Worker vertical slice and core schemas complete.**

Completed items:
1. Canonical schemas: Defined in `worker/src/schemas/index.ts` and verified by unit tests in `worker/tests/schemas.test.ts`.
2. Worker foundation: Hono worker scaffolded with `wrangler.jsonc`, zero-dependency Web Crypto Firestore REST client (`worker/src/lib/firestore.ts`), strict CORS, request ID middleware, structured error handler, and 128KB body limits (`worker/tests/app.test.ts`, `worker/tests/firestore.test.ts`).
3. Public catalog API: Implemented in `worker/src/routes/catalog.ts` (`GET /v1/catalog/products` and `GET /v1/catalog/products/:slug`) with category filtering, search, pagination bounds, CDN asset resolution, and cache headers (`worker/tests/catalog.test.ts`).
4. Public enquiries API: Implemented in `worker/src/routes/enquiries.ts` (`POST /v1/enquiries`) with server-side Turnstile verification, request idempotency, and atomic Firestore batch writes (`worker/tests/enquiries.test.ts`).
5. Authenticated orders API: Implemented in `worker/src/routes/orders.ts` (`POST /v1/orders`) with Bearer token authentication, server-side price recalculation from Firestore, rejection of quote-only/draft items, and atomic transaction commits (`worker/tests/orders.test.ts`).
6. Catalog migration/seed script: Created in `scripts/seed-catalog.ts` and verified by `worker/tests/seed-catalog.test.ts`.
7. Storefront integration: Connected in `ecommerce-api-inventory` via `src/lib/api.ts`, updating `BulkEnquiryPage.tsx`, `ContactPage.tsx`, `ProductsPage.tsx`, and `ProductDetailPage.tsx` with real states, error retries, and zero simulated success.

Remaining infrastructure configuration:
- Configure production Cloudflare Worker secrets: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `TURNSTILE_SECRET_KEY`.
- Run catalog seed migration against production Firestore when live credentials are bound.

- Cloudflare account with Worker, R2, DNS, and Turnstile permissions
- Approved public, portal, API, and asset domains
- A second Firebase project if development and production are to remain isolated
- Firebase Console access to enable email/password and Google sign-in providers

No MCP is required. Firebase and Cloudflare CLIs plus project credentials are sufficient. An MCP may improve inspection, but it does not replace environment access or security review.

### Task 1: Define canonical schemas

**Files:**
- Create: `worker/src/schemas/`
- Create: contract fixtures consumed by dashboard tests and copied to the storefront repository

Define and test users, organizations, memberships, products, categories, content, enquiries, quotes, orders, service requests, documents, audit events, mail outbox, idempotency, and API error schemas.

Use integer paise, server timestamps, R2 object keys, immutable line/address snapshots, `salesMode: direct | quote | both`, and explicit publication states.

### Task 2: Configure Firebase environments

1. [ ] Create separate development and production Firebase projects. One initial project, `kitchen-bots`, exists.
2. [ ] Enable email/password and Google authentication in Firebase Console.
3. [ ] Register and verify separate storefront and portal web applications. The supplied web app configuration is currently wired into the dashboard environment.
4. [x] Configure Auth and Firestore emulators.
5. Keep service-account credentials in Worker secrets only.
6. [x] Document public Firebase web variables separately from secrets.

Current deployed baseline:

- Project: `kitchen-bots`
- Firestore database: `(default)` in `nam5`
- Rules: deny all reads and writes until tested collection rules replace the baseline
- Indexes: empty
- Emulator ports: Auth `9099`, Firestore `8080`, UI `4000`
- Analytics: available through an explicit consent-gated initializer; not started automatically

### Task 3: Implement Firestore Rules with tests

Write failing Emulator tests for default denial, self ownership, organization membership, cross-account denial, editor catalog/content access, operations workflow access, admin access, and forbidden customer edits to roles, totals, prices, ownership, publication state, and operational state.

Implement the minimum rules required to pass each test.

### Task 4: Scaffold the Worker

**Files:**
- Create: `worker/`
- Create: `worker/wrangler.jsonc`

1. Add Hono routing under `/v1` and a minimal `/health` endpoint.
2. Add request IDs, strict CORS, body limits, structured errors, and redacted logging.
3. Verify Firebase ID tokens and custom claims.
4. Access Firestore with least-privilege service credentials.
5. Bind public and private R2 buckets.
6. Test invalid, expired, missing, and valid credentials.

### Task 5: Build public catalog endpoints

1. Return published public fields only.
2. Support stable product slug lookup, category filter, sort, and bounded pagination.
3. Cache responses with a short TTL and version key.
4. Never expose internal notes, cost data, audit data, or unpublished records.
5. Add contract tests matching storefront fixtures.

### Task 6: Build enquiry and order endpoints

1. Verify Turnstile for public enquiries.
2. Require verified Firebase identity for direct orders.
3. Recalculate product price, discount, tax, and total from Firestore.
4. Reject quote-only, unpublished, unavailable, or invalid products.
5. Atomically create business record, audit event, mail-outbox entry, and idempotency record.
6. Return stable reference numbers and structured failures.

### Task 7: Secure R2

1. Keep existing catalog media public through `assets.kitchenbots.in`.
2. Create a separate private document bucket.
3. Authorize private upload and download through the Worker.
4. Return short-lived access only after ownership and role checks.
5. Verify guessed object keys cannot bypass authorization.

## Environment Contract

Public variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_API_BASE_URL
VITE_TURNSTILE_SITE_KEY
```

Worker secrets and bindings:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
TURNSTILE_SECRET_KEY
RESEND_API_KEY
PUBLIC_MEDIA
PRIVATE_DOCUMENTS
```

## Acceptance Criteria

- Emulator permission matrix passes.
- Worker authentication, validation, idempotency, and error tests pass.
- Public catalog exposes published fields only.
- Order totals ignore browser totals.
- Private objects are inaccessible without authorization.
- No secret appears in Git, logs, browser bundles, or snapshots.

## Rollback

Deploy deny-by-default rules and versioned routes. Keep applications off new write paths until endpoint and rules tests pass. Disable a route rather than weakening authorization.
