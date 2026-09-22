# Dashboard Phase 03: Portal, Integrations, and Deployment Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Complete customer self-service, transactional email, data migration, production deployment, monitoring, and operational recovery.

**Architecture:** Customer routes use Firebase identity and Firestore Rules for scoped reads, while sensitive actions use the Worker. Immutable deployments and repeatable migrations allow safe production promotion and rollback.

**Tech Stack:** Refine, Firebase Auth, Firestore, R2, Resend, Cloudflare Workers Static Assets, Wrangler, Playwright.

---

## Status

**Blocked by Phases 01-02. Not started.**

No production customer authorization, private R2 document flow, transactional email outbox, migration tooling, deployment pipeline, monitoring, backup procedure, or operational runbook is verified. Existing customer screens are interface scaffolding only.

### Task 1: Complete customer portal

1. Show only the signed-in customer or selected authorized organization.
2. Provide orders, quotes, documents, profile, organization summary, and service requests.
3. Support verified enquiry claiming.
4. Remove all admin navigation and actions from customer layouts.
5. Test forbidden direct URLs and cross-account queries.

### Task 2: Implement transactional email

1. Verify sending domain with SPF, DKIM, and DMARC.
2. Add factual templates for enquiry, order, quote, document, and service events.
3. Process `mailOutbox` with idempotent Resend keys.
4. Retry with attempt count, next-attempt time, and terminal failure state.
5. Never roll back a committed order or enquiry because email failed.

### Task 3: Migrate data

1. Convert storefront static product data through canonical Zod schemas.
2. Preserve product IDs, slugs, and R2 keys.
3. Detect placeholder or missing media.
4. Support dry-run, development, production, and safe rerun modes.
5. Report created, updated, skipped, and rejected records.
6. Export any real Sheet data before retiring GAS.

### Task 4: Deploy platform services

1. Deploy portal static assets and API Worker from known commits.
2. Create preview deployments without production data access.
3. Configure `portal.kitchenbots.in`, `api.kitchenbots.in`, and `assets.kitchenbots.in`.
4. Store secrets only in platform secret stores.
5. Configure strict origins, security headers, rate limits, and redacted logs.
6. Retain known-good deployment versions.

### Task 5: Run production verification

Test authentication, verification, password reset, guest enquiry, duplicate replay, order price tampering, enquiry claiming, publishing, workflow transitions, organization permissions, private files, email failure/retry, mobile portal behavior, keyboard behavior, and catalog-cache freshness.

### Task 6: Add monitoring and runbooks

Monitor Worker errors/requests, Firestore operations/storage, R2 usage, email delivery/bounces, and frontend errors.

Write runbooks for staff claims, rollback, failed orders, email retry, private document revocation, data export, quota exhaustion, and credential rotation.

### Task 7: Update architecture context

Update `../../../PROJECT_ARCHITECTURE_CONTEXT.md` only after production verification. Remove obsolete descriptions of GAS, mocked auth, static runtime catalog, and simulated orders. Never include secrets.

## Acceptance Criteria

- Customer portal cannot expose other customers or organizations.
- Migration is repeatable and validated.
- Email failures retry without duplicating business records.
- Preview and production deployments map to known commits.
- Security, responsive, accessibility, and production smoke tests pass.
- Written rollback and incident procedures are usable.

## Rollback

Roll back static portal and Worker deployments independently. Use additive Firestore migrations and forward repair scripts instead of destructive reversal.
