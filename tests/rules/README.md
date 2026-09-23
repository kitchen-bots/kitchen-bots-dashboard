# Firestore Rules Tests

The rules matrix lives in `firestore.rules.test.ts` and runs against the
Firebase Emulator Suite.

## Run

```bash
npm run test:rules
```

The script (`scripts/run-rules-tests.sh`) boots a dedicated Firestore
emulator on port 8081 via `firebase.rules-test.json`, runs the matrix with
`vitest.rules.config.ts`, and shuts the emulator down. Requires Java. The
default dev stack keeps port 8080 for the long-running emulator
(`npm run emulators`), which is why the test runner uses 8081.

## What the matrix proves

1. Default denial: unauthenticated reads and writes fail, including the
   Worker-only collections (`auditEvents`, `mailOutbox`, `idempotencyKeys`)
   even for admins.
2. Catalog: published products are publicly readable; drafts are staff-only;
   editors create drafts but cannot flip publication state or delete; admins
   can delete.
3. Orders: customers read only their own orders and cannot create orders or
   change statuses directly (Worker-only); operations can progress orders;
   customer list queries must filter on their own uid.
4. Users: self-read and display-field edits work; role or status self-writes
   are denied; customers cannot read other profiles.
5. Enquiries: the verified email owner can read their enquiry; unverified or
   mismatched emails are denied; direct client creation is denied (public
   intake goes through POST /v1/enquiries).
6. Documents: ownership reads work; cross-customer reads are denied;
   operations can manage records.
