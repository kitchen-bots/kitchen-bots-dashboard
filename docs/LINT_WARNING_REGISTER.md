# Dashboard Lint Warning Register

Phase 00 clears all lint errors. Remaining warnings are registered here instead of hidden by weaker ESLint rules.

## Phase 01 provider and API migration

- Unused placeholder parameters in leads, products, permissions, communications, and event subscriber services.
- `prefer-const` warnings in legacy API and mock service implementations.
- These files will change or be removed when GAS and mock providers are replaced.

## Phase 02 component migration

- Fast Refresh export-boundary warnings in context and UI barrel files.
- Hook dependency warnings in command palette, file upload, and product management.
- React Compiler compatibility warnings around React Hook Form `watch` and TanStack Table.
- Resolve while migrating each screen to production Refine providers. Do not suppress compiler warnings globally.

## Legacy test cleanup

- Unused import in `tests/legacy/verify_business_scenarios.ts`.
- Remove or convert legacy scripts when production workflow tests replace them.

## Gate

No new warning is accepted without adding an owner and removal phase to this register.
