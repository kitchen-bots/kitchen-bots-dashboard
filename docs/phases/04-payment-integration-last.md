# Dashboard Phase 04: Payment Integration Last Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Add real online payment only after the core platform is secure, deployed, and operationally proven.

**Architecture:** A provider-neutral adapter creates sessions from authoritative orders. Signed, idempotent webhooks create immutable payment events and update derived order payment status.

**Tech Stack:** Cloudflare Worker, Hono, Zod, selected payment provider REST API or SDK, Firestore, Firebase Auth, Vitest, Playwright.

---

## Status

**Deferred. Do not start.**

No payment provider or merchant account is approved. Phase 04 remains outside active work until Phase 03 passes and leadership confirms provider, settlement, refund, deposit, and compliance requirements.

## Entry Gate

- All Phase 03 criteria pass.
- The business selects a provider.
- Merchant onboarding and settlement details are complete.
- Refund policy and webhook secrets are available.
- Each eligible product has an approved full-payment, deposit, or offline-payment policy.

### Task 1: Define the provider adapter

Define and test:

```text
createSession(order)
verifyWebhook(rawRequest)
fetchPayment(providerPaymentId)
refund(payment, amountPaise, reason)
```

Store provider, internal order ID, amount, currency, purpose, status, references, timestamps, refund summary, and raw-event hash. Store the minimum provider payload needed for reconciliation.

### Task 2: Create payment sessions

1. Require verified identity and order ownership.
2. Load amount from Firestore, never the browser.
3. Reject quote-only, paid, cancelled, expired, or ineligible orders.
4. Use idempotency for session creation.
5. Persist session state before responding.
6. Keep all secret keys in Worker secrets.

### Task 3: Support checkout safely

1. Return only provider-safe client checkout details.
2. Distinguish deposit and full payment clearly.
3. Treat browser callback success as `verification_pending`.
4. Support cancellation, timeout, retry, and pending states.
5. Do not mark orders paid until webhook reconciliation.

### Task 4: Reconcile webhooks

1. Verify signature against the exact raw body.
2. Deduplicate provider events.
3. Match amount, currency, merchant, provider order, and internal order.
4. Store event and update derived status atomically.
5. Handle duplicate, delayed, and out-of-order events.
6. Log exceptions without exposing financial credentials.

### Task 5: Add refunds and operations controls

1. Restrict refund creation to authorized staff.
2. Validate refundable balance.
3. Make refund requests idempotent.
4. Display payment and refund timelines.
5. Provide a manual reconcile action that fetches provider state but cannot arbitrarily set it.

## Required Tests

- Provider outage and session retry.
- Duplicate session.
- Browser cancellation.
- Callback before webhook.
- Webhook before browser return.
- Invalid signature.
- Wrong amount or currency.
- Duplicate, delayed, and out-of-order webhook.
- Partial and full refund.
- Unauthorized refund or cross-order access.

## Acceptance Criteria

- Client input cannot lower the charge or mark an order paid.
- Sessions, webhooks, and refunds are idempotent.
- Signature and amount verification are tested.
- Reconciliation failures are visible to operations.
- Payment event history is immutable.
- Sandbox and low-value live verification pass before general enablement.

## Rollback

Disable new session creation with a server-side feature flag while continuing to receive and reconcile already-issued sessions. Never disable webhook processing during rollback.
