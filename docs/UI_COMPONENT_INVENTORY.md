# Dashboard UI Component Inventory

## Approved shared primitives

- Actions: `Button`
- Status: `Badge`, `Alert`, `Toast`
- Forms: `Input`, `Textarea`, `Label`, `Checkbox`, `RadioGroup`, `Select`, `Switch`, `Form`
- Data: `Table`, `DataGrid`, pagination and toolbar modules
- Surfaces: `Card`, `Accordion`, `Tabs`, `Popover`, `DropdownMenu`, `Tooltip`
- Overlays: `Modal`, `Drawer`
- Feedback: `LoadingState`, `EmptyState`, `ErrorState`, `Skeleton`, `Spinner`
- Presentation: `Avatar`, `Typography`, `Timeline`, `AnimatedPage`

## Token source

- Semantic CSS variables: `src/index.css`
- Tailwind mappings: `tailwind.config.js`
- Shared class helper: `src/dashboard/utils/cn.ts`

## Usage rules

- Reuse shared primitives before adding a new component.
- Use moderate radii. Buttons remain rectangular, not pill-shaped.
- Use badges only for compact status, never as decorative copy.
- Use green for brand and primary actions. Use orange for warnings or functional emphasis.
- Keep visible focus, disabled, loading, empty, error, and permission states.
- Do not add fake users, metrics, activity, reviews, product facts, or stock imagery.

## Development showcase

Run the development server and open `/__ui`. The route is conditionally registered only in development and is absent from production routing.
