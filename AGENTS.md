# Kitchen Bots Dashboard Development Rules

These instructions apply to every file in this repository, including the Cloudflare Worker.

## Visual and Content Rules

The dashboard and customer portal must never look vibe coded.

Never use:

- Purple AI-style gradients.
- Pill-shaped buttons.
- Fake reviews, testimonials, ratings, users, activity, revenue, or metrics.
- Vague headings or promotional copy.
- Emoji as interface icons.
- Em dashes in interface copy, documentation, or code comments.
- Over-the-top scroll animations.
- AI-generated filler photos or AI-style filler copy.
- Cursor animations or custom cursors.
- Fake counters or dashboard statistics.

Use real operational data, clear labels, accessible controls, restrained motion, and the Kitchen Bots brand system at an appropriate dashboard density.

## Engineering and Security Rules

- Make the smallest correct change required by the approved phase plan.
- Use Refine and shadcn primitives before building duplicate framework behavior.
- Firestore is the operational source of truth. Do not reintroduce Google Sheets as a production database.
- Enforce authorization in Firebase Rules or the Worker. UI permission checks are never sufficient by themselves.
- Never trust browser-supplied roles, prices, totals, ownership, state transitions, or payment status.
- Never simulate successful authentication, writes, email, document access, or payment.
- Add or update tests before changing important behavior.
- Run type checking, lint, tests, Worker tests, Firebase Rules tests, and production builds before declaring work complete.
- Report failures honestly. Never weaken tests, types, lint, rules, validation, or authorization to make checks pass.
- Do not commit secrets, private keys, API tokens, customer data, or private document URLs.
- Follow `docs/MASTER_PLAN.md` and `docs/phases/` unless the user explicitly changes scope.

## Completion Gate

Run all commands applicable to the changed subsystem:

```bash
npm ci
npm run lint
npm run test
npm run build
```

Worker and Firebase commands will be added in the infrastructure phase and become mandatory after that phase.

## Daily Git & PR Workflow

Always follow this exact workflow when starting work, committing, opening PRs, and making follow-up updates in this repository:

### 1. Start Work
```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
git switch -c charan/<task-name>
```

### 2. Commit Changes
```bash
git add <path/to/files>
git diff --cached --check
npm run check
git commit -m "feat: describe the change"
git push -u origin HEAD
```

### 3. Open PR
```bash
gh pr create \
  --repo kitchen-bots/kitchen-bots-dashboard \
  --base main \
  --head "workofcharan:$(git branch --show-current)"
```

### 4. Follow-up Changes on the Same PR
```bash
git add <path/to/files>
npm run check
git commit -m "fix: describe the correction"
git push
```
