# Dashboard, Portal, and API Development Rules

## Non-negotiable UI rules

- No purple AI-style gradients.
- No pill-shaped buttons.
- No fake operational data, charts, people, activity, metrics, testimonials, or counters.
- No vague headings or filler text.
- No emoji icons.
- No em dashes.
- No excessive scroll animation.
- No AI-generated filler imagery or copy.
- No cursor animation.

## Required design qualities

- Use shadcn/ui and Radix behavior with Kitchen Bots tokens.
- Keep layouts compact enough for operational work without making them cramped.
- Use real loading, empty, error, permission-denied, and offline states.
- Use Lucide icons consistently.
- Use accessible tables, forms, dialogs, menus, toasts, and focus states.
- Show only genuine data returned by Firestore or trusted APIs.
- Do not display a KPI when its query and definition are not production-backed.

## Required engineering qualities

- Deny access by default.
- Validate input with Zod at every trusted boundary.
- Keep money in integer paise and use authoritative server timestamps.
- Use idempotency for externally retried writes.
- Store private R2 keys, never permanent public document URLs.
- Keep business state transitions explicit and tested.
- Add audit records for protected staff actions.
- Redact credentials and customer-sensitive fields from logs.
