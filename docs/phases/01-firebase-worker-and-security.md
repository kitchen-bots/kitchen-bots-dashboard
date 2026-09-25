# Dashboard Phase 01: Firebase, Worker, and Security Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build the canonical schemas, Firebase environments, Firestore Rules, Worker API, R2 boundaries, and abuse protection required by both applications.

**Architecture:** Firebase Auth and Firestore provide identity and data. A Hono Worker handles public submissions, authoritative calculations, role management, private files, email orchestration, and later payments.

**Tech Stack:** Firebase Auth, Cloud Firestore, Firebase Emulator Suite, Hono, Zod, Cloudflare Workers, R2, Turnstile, Vitest.

---

## Status

**Started on 2026-09-22. Production backend implementation is not complete.**

Firebase project `kitchen-bots` is associated with this repository. The web SDK, public environment contract, Auth and Firestore emulator ports, and deny-by-default Firestore Rules are configured. The rules and empty index definition were deployed successfully on 2026-09-22. The default Firestore database was created in `nam5` and must be reviewed before real data is added.

The application still uses mock authentication, Google Apps Script clients, Google Sheets CRUD modules, and in-memory services. These remain legacy or development paths. Authentication providers, separate development and production Firebase projects, Rules tests, canonical schemas, the Worker, Wrangler, R2 bindings, and Turnstile enforcement are not implemented.

External access needed before tasks 2-7:

- Cloudflare account with Worker, R2, DNS, and Turnstile permissions
- Approved public, portal, API, and asset domains
- A second Firebase project if development and production are to remain isolated
- Firebase Console access to enable email/password and Google sign-in providers

No MCP is required. Firebase and Cloudflare CLIs plus project credentials are sufficient. An MCP may improve inspection, but it does not replace environment access or security review.

### Task 1: Define canonical schemas

**Status: Completed.**

Defined and verified in `worker/src/schemas/index.ts` with 43 passing tests in `worker/tests/schemas.test.ts`. Covers users, organizations, memberships, products, categories, content, enquiries, quotes, orders, service requests, documents, audit events, mail outbox, idempotency, and API error schemas. Uses integer paise, ISO timestamps, R2 object keys, immutable line/address snapshots, `salesMode: direct | quote | both`, and explicit publication states.

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

**Status: Implemented & Deployed.**

Implemented in `worker/src/app.ts` with Hono routing under `/v1`, `/health` liveness endpoint, request ID injection, strict CORS, 128KB body limits, structured API errors, and test-injected authentication / firestore services. Verified by 5 tests in `worker/tests/app.test.ts`. Deployed to Cloudflare Workers at `https://kitchen-bots-api.workofcharan.workers.dev`.

### Task 5: Build public catalog endpoints

**Status: Implemented.**

Implemented in `worker/src/routes/catalog.ts`. Supports `/v1/catalog/products` and `/v1/catalog/products/:slug` with bounded pagination, category filtering, search query handling, and public field filtering (hides internal cost/margin data). Validated against contract fixtures with 10 passing tests in `worker/tests/catalog.test.ts`.

### Task 6: Build enquiry and order endpoints

**Status: Implemented.**

Implemented in `worker/src/routes/enquiries.ts` and `worker/src/routes/orders.ts`. Features Turnstile token verification, Idempotency-Key deduplication, Zod schema validation, server-side price calculation, and fail-closed security when secrets are missing. Verified with 7 tests in `worker/tests/enquiries.test.ts` and 5 tests in `worker/tests/orders.test.ts`.

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
