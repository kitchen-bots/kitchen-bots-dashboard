# Kitchen Bots Dashboard and Platform Master Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Deliver the production backend, CMS, CRM, admin dashboard, customer portal, integrations, private documents, email, infrastructure, and final payment layer for Kitchen Bots.

**Architecture:** This repository owns the Refine dashboard and customer portal plus a Hono Cloudflare Worker API. Firebase Auth and Firestore provide identity and operational data, R2 stores public media and private documents, and Resend provides transactional email.

**Tech Stack:** React, Vite, TypeScript, Refine Core v5, shadcn/ui, Firebase Auth, Cloud Firestore, Cloudflare Workers, Hono, Zod, R2, Resend, Vitest, Firebase Emulator Suite, Playwright.

---

## Repository Boundary

This repository owns:

- Admin dashboard and customer portal.
- Firebase project configuration and Firestore Rules.
- Canonical operational schemas.
- Public catalog and trusted mutation API.
- CMS and CRM workflows.
- Orders, enquiries, quotes, documents, service requests, and audit events.
- R2 document access and upload authorization.
- Transactional email and retry behavior.
- Infrastructure, deployment, monitoring, migrations, and runbooks.
- Payment provider integration in the final phase.

The ecommerce repository owns storefront presentation, cart, quote/order forms, and Firebase customer sign-in UI.

## Required Reading

- [Development Rules](DEVELOPMENT_RULES.md)
- [Phase 00: Baseline and Framework Foundation](phases/00-baseline-and-framework-foundation.md)
- [Phase 01: Firebase, Worker, and Security](phases/01-firebase-worker-and-security.md)
- [Phase 02: Refine CMS and CRM](phases/02-refine-cms-crm.md)
- [Phase 03: Portal, Integrations, and Deployment](phases/03-portal-integrations-and-deployment.md)
- [Phase 04: Payment Integration Last](phases/04-payment-integration-last.md)
- [Backend Status and Implementation Report](../../kitchen-bots-ecommerce/docs/reports/BACKEND_STATUS_REPORT.md)
- [UI Component Inventory](UI_COMPONENT_INVENTORY.md)
- [Lint Warning Register](LINT_WARNING_REGISTER.md)

## Delivery Order

| Phase | Outcome | Dependency |
|---|---|---|
| 00 | Clean baseline and Refine/shadcn foundation | None |
| 01 | Auth, Firestore, rules, Worker API, R2, contracts | Phase 00 |
| 02 | Production-backed CMS, CRM, and operational workflows | Phase 01 |
| 03 | Customer portal, emails, migration, deployment, runbooks | Phases 01-02 |
| 04 | Real payments and webhook reconciliation | Phase 03 and merchant approval |

## Current Phase State

| Phase | State | Verified blocker or next gate |
|---|---|---|
| 00 | Implementation complete; verification passed | Review and merge Phase 00 branch under Node 22 CI |
| 01 | Blocked | Phase 00 acceptance gate and Firebase/Cloudflare project access |
| 02 | Blocked | Phase 01 schemas, Auth, Rules, and Worker API |
| 03 | Blocked | Production-backed CMS/CRM workflows |
| 04 | Deferred | Phase 03 completion and merchant approval |

## Canonical API

```text
GET  /v1/catalog/products
GET  /v1/catalog/products/:slug
POST /v1/enquiries
POST /v1/orders
POST /v1/enquiries/:id/claim
GET  /v1/documents/:id/access
POST /v1/admin/staff-claims

Deferred until Phase 04:
POST /v1/payments/sessions
POST /v1/webhooks/payments/:provider
```

Mutation endpoints accept `Idempotency-Key`. Authenticated routes require a Firebase ID token. Public enquiries require Turnstile. Errors use `{ code, message, requestId, fieldErrors? }`.

## Canonical Collections

```text
users
organizations
memberships
products
categories
content
enquiries
quotes
orders
serviceRequests
documents
auditEvents
mailOutbox
idempotencyKeys
payments
paymentEvents
```

Payment collections are inactive until Phase 04. Money uses integer paise and `INR`. Protected timestamps are server-generated. Orders and quotes snapshot line items and addresses.

## Roles

| Role | Authority |
|---|---|
| Customer | Own or organization-authorized commerce, documents, and service data |
| Editor | Catalog and content publishing |
| Operations | Customers, enquiries, quotes, orders, documents, and service requests |
| Admin | All staff behavior plus protected staff-claim management |

Staff authority comes from Firebase custom claims, never an editable profile field.

## Platform Guardrails

- Firestore is the operational source of truth.
- Google Sheets and Apps Script are retired from production.
- Firestore Rules and Worker authorization deny by default.
- Client-side permission checks improve UX but never grant authority.
- Public catalog responses contain published public fields only.
- Public R2 media and private customer documents use separate buckets.
- Email failure cannot roll back a committed order or enquiry.
- Protected state changes create audit records.
- No fake KPI, chart, user, activity, or revenue data reaches production.

## Global Acceptance Gate

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
```

After Phase 01, Worker tests and Firebase Emulator Rules tests are mandatory. After Phase 03, Playwright production smoke tests and deployment verification are mandatory.

## Deferred Until After Core Release

- Equipment telemetry.
- Advanced inventory and warehouse movement accounting.
- Customer staff-management workflows.
- Full ERP or accounting features.
- SMS and WhatsApp automation.
- Heavy PDF, video, or image processing in Workers.
- Payment capture until Phase 04.

## Definition of Platform Readiness

The core platform is ready when editors publish real catalog data, operations manage real enquiries, quotes, orders, documents, and service requests, customers can access only their authorized records, email retries safely, deployments are reversible, and no mock or Google Sheets production path remains.
