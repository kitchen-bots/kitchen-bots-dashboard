# Dashboard Phase 02: Refine CMS and CRM Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Replace mock and Google Apps Script behavior with production-backed Refine resources and explicit operational workflows.

**Architecture:** Refine providers supply reusable CRUD, authentication, authorization, table, form, notification, and audit behavior. Firestore handles rule-safe access; trusted state transitions call the Worker.

**Tech Stack:** Refine Core, shadcn/ui, Firebase Auth, Firestore, Worker API, TanStack Table, React Hook Form, Zod, Tiptap Community, Recharts.

---

### Task 1: Implement production providers

1. Implement Firebase `authProvider` for login, Google sign-in, logout, identity, registration, verification, and password reset.
2. Implement `accessControlProvider` for customer, editor, operations, and admin roles.
3. Implement Firestore `dataProvider` for rule-safe CRUD.
4. Implement Worker calls for protected mutations.
5. Add notification and audit providers.
6. Test provider error and permission behavior.

### Task 2: Migrate CMS resources

Migrate categories, products, media ordering, FAQ, articles, and editable content.

For every resource:

1. Write list/filter/form tests.
2. Add list, create, edit, and show views.
3. Use schema-derived validation.
4. Enforce access in UI and backend.
5. Add preview links.
6. Verify publish/unpublish/archive behavior through the public API.

### Task 3: Migrate CRM resources

Migrate customers, organizations, memberships, enquiries, and quotes.

Required workflows:

- Assign and progress enquiries.
- Add genuine notes and follow-up dates.
- Convert enquiry to quote without duplicating customer data.
- Send, accept, reject, and expire quotes.
- Claim enquiries after verified email ownership.
- Record audit events for protected changes.

### Task 4: Migrate operations resources

Migrate orders, private documents, and service requests.

1. Enforce explicit allowed order transitions.
2. Prevent generic edit forms from bypassing workflow rules.
3. Upload private documents through authorized Worker endpoints.
4. Grant document visibility to the correct user or organization.
5. Progress service requests through defined states.
6. Display real activity only.

### Task 5: Remove mocks and GAS

1. Replace mock authentication and local tokens.
2. Remove hard-coded admin credentials.
3. Replace mock services and arrays as each resource migrates.
4. Replace Google Apps Script API consumers.
5. Remove placeholder KPI, charts, avatars, activity, and fake URLs.
6. Delete GAS code only after any real data export is complete.

## Acceptance Criteria

- Firebase authentication replaces mock credentials.
- Editors manage real catalog and content.
- Operations manage real enquiries, quotes, orders, documents, and service requests.
- Protected transitions cannot be bypassed by generic CRUD.
- All screens have loading, empty, error, and permission-denied states.
- No mock or GAS production path remains.
- Tests, lint, type checking, and build pass.

## Rollback

Migrate one resource behind a configuration flag. Retain the previous screen as read-only until parity, then remove it in a separate commit.
