# Dashboard Phase 00: Baseline and Framework Foundation Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Repair the verified dashboard baseline and introduce Refine plus the Kitchen Bots shadcn design system without a disruptive rewrite.

**Architecture:** Preserve working routes and screens while adding Refine providers around them. Migrate resources incrementally and remove legacy abstractions only after parity.

**Tech Stack:** React, Vite, TypeScript, Refine Core, shadcn/ui, React Router, TanStack Table, React Hook Form, Zod, Vitest.

---

### Task 1: Stabilize the repository

1. Pin Node 22 and compatible npm.
2. Add explicit `typecheck` and aggregate `check` scripts.
3. Fix conditional hooks in `src/dashboard/pages/admin/AdminOrderDetails.tsx` with a regression test.
4. Clear all lint errors.
5. Triage warnings into fixes or named later migrations.
6. Upgrade vulnerable production dependencies without `npm audit fix --force`.
7. Confirm all existing tests and production build pass.

### Task 2: Establish design tokens and primitives

1. Inventory existing UI components before adding shadcn equivalents.
2. Define Kitchen Bots brand, neutral, surface, text, border, focus, success, warning, and error tokens.
3. Use compact operational spacing and moderate radii.
4. Create a component showcase for forms, tables, dialogs, badges, tabs, toasts, skeletons, empty states, and errors.
5. Remove fake dashboard statistics, avatars, activity, and stock imagery as screens migrate.

### Task 3: Introduce Refine providers

**Files:**
- Modify: `src/App.tsx`
- Create: `src/providers/`

1. Add Refine Core and router integration around current routes.
2. Define resource names and stable route ownership.
3. Add placeholder provider interfaces for auth, data, access control, notifications, and audit logs.
4. Keep existing working screens available during migration.
5. Add provider contract tests before Firebase implementation.

### Task 4: Add CI

1. Run clean install, type checking, lint, tests, build, and production audit on pull requests.
2. Block deployment on failures.
3. Avoid uploading environment files or test data containing customer information.
4. Record build artifacts only when needed for diagnostics.

## Acceptance Criteria

- Existing tests pass.
- Build and lint pass with zero errors.
- Refine is mounted without breaking existing routes.
- Approved shadcn primitives and tokens have accessible states.
- No new fake operational content is introduced.
- No high or critical production advisory remains.

## Rollback

Keep baseline repairs, design foundation, and Refine provider introduction in separate commits. Remove the provider wrapper without reverting baseline fixes if integration fails.
