# Kitchen Bots Dashboard: Developer, Catalog Sync & Git PR Workflow Guide

This guide explains how to develop, test, sync catalog data, push changes to your personal fork, and open Pull Requests against the upstream repository for `kitchen-bots-dashboard`.

---

## 1. Catalog Synchronization

### Overview
The catalog data (products and categories) is mastered in the storefront repository (`kitchen-bots-ecommerce`) and consumed by the operational dashboard (`kitchen-bots-dashboard`).

- **Master Files**: `../kitchen-bots-ecommerce/src/data/products.ts` & `categories.ts`
- **Dashboard Consumer Files**:
  - `src/dashboard/data/catalog.json` (canonical JSON dump)
  - `src/dashboard/data/catalog.ts` (typed exports: `MASTER_CATALOG_PRODUCTS`, `MASTER_CATALOG_CATEGORIES`)
  - `src/dashboard/services/commerce/ProductService.ts`
  - `src/dashboard/services/commerce/InventoryService.ts`
  - `public/products/` (product imagery mirrored locally)

### Running Synchronization Commands
In `kitchen-bots-dashboard`:

```bash
# Synchronize catalog data and assets from ecommerce:
npm run sync:catalog

# Verify synchronization in CI / pre-commit (exits 0 if synced, 1 if differences found):
npm run sync:catalog:check
```

---

## 2. Local Testing and Quality Checks

Before pushing any changes or opening a PR, always verify:

```bash
# 1. Typecheck TypeScript files
npm run typecheck

# 2. Run unit and integration tests (Vitest)
npm run test -- --run

# 3. Test production build
npm run build
```

---

## 3. Git & GitHub Fork Workflow

Contributions to Kitchen Bots repositories follow a fork-and-pull model:
1. You work on your personal fork (`origin`).
2. You submit Pull Requests to the organization repository (`upstream`).

### Remote Configuration
Check your configured remotes:

```bash
git remote -v
```

Expected setup:
- `origin`: `https://github.com/workofcharan/kitchen-bots-dashboard.git` (Your Fork)
- `upstream`: `https://github.com/kitchen-bots/kitchen-bots-dashboard.git` (Kitchen Bots Organization)

If `upstream` is missing:
```bash
git remote add upstream https://github.com/kitchen-bots/kitchen-bots-dashboard.git
```

---

### Step-by-Step: Pushing Changes & Opening a Pull Request

#### Step 1: Ensure Local `main` is Up to Date with `upstream`
Always pull the latest upstream changes before branching:

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
```

#### Step 2: Create a Feature Branch
Use a clear, prefixed branch name:

```bash
git switch -c charan/order-flow-catalog-sync-ui-fixes
```

#### Step 3: Review and Stage Changes
Verify modified and untracked files:

```bash
git status
```

Stage your changes:
```bash
git add .
```

Verify staged files (ensure secrets like `.env` are never staged):
```bash
git diff --cached --stat
```

#### Step 4: Commit with Conventional Messages
```bash
git commit -m "feat(dashboard): fix order creation flow, responsive modals, document UI, and catalog sync"
```

#### Step 5: Push Branch to Your Fork (`origin`)
```bash
git push -u origin charan/order-flow-catalog-sync-ui-fixes
```

*(Any subsequent commits on this branch only require `git push`.)*

#### Step 6: Create the Pull Request to `upstream`

##### Option A: Using the GitHub CLI (`gh`)
From the repository root:

```bash
gh pr create \
  --repo kitchen-bots/kitchen-bots-dashboard \
  --base main \
  --head "workofcharan:$(git branch --show-current)" \
  --title "feat(dashboard): fix order flow, modal responsiveness, document UI, and catalog sync" \
  --body "### Summary of Changes
- **Catalog Sync**: Integrated cross-repository catalog synchronization pipeline with ecommerce.
- **Responsive Modals**: Resolved mobile/tablet button clipping in `Modal.tsx` with dedicated sticky footers and scrollable body.
- **Service Management**: Upgraded ticket dispatching with real catalog equipment selection and high-contrast SLA metrics.
- **Document Management**: Enhanced preview pane layout, standardized download actions, and aligned catalog equipment metadata.
- **Order & Product Services**: Ensured canonical product references and end-to-end data integrity across admin and customer portals."
```

##### Option B: Using the GitHub Web Interface
1. Go to your fork: [https://github.com/workofcharan/kitchen-bots-dashboard](https://github.com/workofcharan/kitchen-bots-dashboard)
2. Click **"Compare & pull request"** on the yellow prompt for your branch.
3. Set **Base repository**: `kitchen-bots/kitchen-bots-dashboard` (branch: `main`).
4. Set **Head repository**: `workofcharan/kitchen-bots-dashboard` (branch: `charan/order-flow-catalog-sync-ui-fixes`).
5. Enter title, description, and click **"Create pull request"**.

---

## 4. Post-Merge Cleanup

After your PR is reviewed and merged into `upstream/main`:

```bash
# Return to main and fetch latest upstream code
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main

# Delete the local feature branch
git branch -d charan/order-flow-catalog-sync-ui-fixes

# Delete the remote feature branch on your fork
git push origin --delete charan/order-flow-catalog-sync-ui-fixes
```
