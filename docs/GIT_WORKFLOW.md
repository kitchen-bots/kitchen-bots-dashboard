# Git Workflow

This workflow applies to both Kitchen Bots repositories and both developers.

## Repository layout

Each developer works through a personal fork.

| Remote | Purpose |
| --- | --- |
| `origin` | Your personal fork. Push feature branches here. |
| `upstream` | The `kitchen-bots` organization repository. Pull updates from here. |

Never push feature work directly to `upstream` or commit directly on `main`.

## Account mapping

| Developer | Fork owner | Branch prefix |
| --- | --- | --- |
| Revanth | `revanthlol` | `revanth/` |
| Charan | `workofcharan` | `charan/` |

## Start a task

Update local `main` from the organization repository before creating a branch.

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
git switch -c your-name/short-task-name
```

Examples:

```bash
git switch -c revanth/firebase-auth
git switch -c charan/product-filters
```

Use one branch for one task. Do not mix unrelated fixes into the same branch.

## Review and commit changes

Stage only the files that belong to the task when practical.

```bash
git status
git add path/to/file path/to/another-file
git diff --cached --stat
git diff --cached --check
npm run check
git commit -m "feat: describe the change"
```

Use `git add -A` only when every changed file belongs to the same task.

Common commit prefixes:

- `feat:` for new behavior
- `fix:` for bug fixes
- `docs:` for documentation only
- `test:` for tests only
- `refactor:` for behavior-preserving restructuring
- `chore:` for tooling and configuration

## Push the branch

```bash
git push -u origin HEAD
```

Later commits on the same branch only need:

```bash
git push
```

## Open a pull request

Replace `REPOSITORY` with `kitchen-bots-ecommerce` or `kitchen-bots-dashboard`.

Revanth:

```bash
gh pr create \
  --repo kitchen-bots/REPOSITORY \
  --base main \
  --head "revanthlol:$(git branch --show-current)"
```

Charan:

```bash
gh pr create \
  --repo kitchen-bots/REPOSITORY \
  --base main \
  --head "workofcharan:$(git branch --show-current)"
```

## Pull request requirements

A pull request can merge only when:

1. The `verify` check passes.
2. The other developer approves it.
3. All review conversations are resolved.
4. The branch is current with `upstream/main`.

Do not use `npm audit fix --force` to make CI green. Investigate and upgrade breaking dependencies deliberately.

## Update a branch after review

```bash
git add path/to/changed/files
git diff --cached --check
npm run check
git commit -m "fix: address review feedback"
git push
```

The existing pull request updates automatically.

## After a pull request merges

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
```

Create the next task from this updated `main` branch.

## Safety rules

- Never commit `.env` files, credentials, access keys, or generated build output.
- Never run `git push --force` on shared branches.
- Never use `git reset --hard` to solve synchronization problems without checking what would be lost.
- Do not merge code that has not passed `npm run check`.
- Do not bypass the protected `main` branch.
