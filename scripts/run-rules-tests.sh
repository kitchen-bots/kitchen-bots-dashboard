#!/usr/bin/env bash
# Firestore Rules test runner (Phase 01, Task 3).
#
# Boots the Firestore emulator on port 8081 (the default 8080 is used by the
# dev emulator stack documented in firebase.json) and runs the rules matrix
# against it. Requires Java.
set -euo pipefail
cd "$(dirname "$0")/.."

exec npx firebase emulators:exec \
  --only firestore \
  --project rules-test-kb \
  --config firebase.rules-test.json \
  "FIRESTORE_EMULATOR_PORT=8081 npx vitest run --config vitest.rules.config.ts"
