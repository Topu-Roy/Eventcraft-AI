---
name: nextjs-react-best-practices
description: React and Next.js best practices for modern codebases using React 19, React Compiler, TanStack Query, TanStack Form, Jotai, shadcn/ui, and Zod v4. Use when writing, reviewing, or refactoring React/Next.js code. Triggers on tasks involving React components, Next.js pages, data fetching, mutations, forms, state management, or UI patterns.
license: MIT
metadata:
  author: custom
  version: "1.0.0"
---

# Next.js + React Best Practices & Modern Patterns

You are working in a React codebase that uses the **React Compiler** (formerly React Forget). This fundamentally changes several rules because the compiler handles memoization automatically.

This project uses **Next.js** with the React Compiler enabled via `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
}

export default nextConfig
```

And React 19:

```json
"react": "^19.2.4"
```

The compiler is active for all components. Do not add manual memoization unless there is a specific, justified reason.

---

## How to Apply These Rules

Do not try to apply every optimization all at once. Do not sweep the entire codebase in one pass. Work route by route, area by area. This keeps changes focused, reviewable, and correct.

### Step 1 — Pick a route

Start with one route, for example `/`. Identify all components, hooks, atoms, and utilities that are used on that route. Treat them as one unit.

### Step 2 — Pick one skill area and apply all its rules across every component on the route

Choose one area from the list below and go through every component on the route checking only that area's rules. Apply all necessary changes before moving to the next area.

```
Area 1 — Project Organization  (Rules 2, 3)
  → Are files in the right place? Named correctly? Descriptive variable names? JSDoc on utils?

Area 2 — Component Architecture  (Rules 1, 4, 5, 6)
  → Right size? Should anything be split or kept together?
    Props typed with `type`? `"use client"` as deep as possible?
    React Compiler active — no manual useMemo/useCallback/React.memo?

Area 3 — State & Logic  (Rules 7, 8, 9, 10)
  → Derived state in useState? useEffect misuse?
    Conditional rendering using ternary + null?
    Refs used correctly? Effects have cleanup?

Area 4 — Data — Reading  (Rules 11, 12)
  → useQuery used? Hooks reusable and called in the child, not passed as props?
    Loading, error, and empty states all handled?
    Skeletons used for content, spinners only for actions/buttons?

Area 5 — Data — Writing  (Rules 13, 14)
  → useMutation used? Cache invalidated on success?
    Forms using TanStack Form + Zod v4 + shadcn Field?

Area 6 — Lists  (Rule 15)
  → Stable, unique keys — not index?

Area 7 — Quality  (Rules 16, 17)
  → Semantic HTML? Interactive elements labeled? Images have alt text?
    Focus outlines not removed? Color not used as the only signal?
```

Work through each area in order. After all areas are complete for the route, every component on it has been fully reviewed.

### Step 3 — Move to the next route

Once all areas are applied to the current route, pick the next route and repeat from Step 1. Continue until all routes are covered.

### Step 4 — Skip checks that don't apply

Use judgment — not every rule applies to every component:

- Presentational components with no data don't need a data layer sweep
- Server Components don't need state management checks
- Tiny, single-use helpers don't need JSDoc
- A component that is already small and focused doesn't need a splitting review

The goal is a consistent, maintainable codebase — not mechanical compliance. Apply rules where they genuinely add value.

---

## 1. React Compiler — What Changes

The compiler statically analyzes components and auto-applies memoization. This makes several manual optimizations **redundant and noisy**:

| Antipattern | Why it's wrong now | What to do instead |
| --- | --- | --- |
| `useMemo(() => compute(a, b), [a, b])` | Compiler already memoizes derived values automatically | Remove it; write plain computation inline |
| `useCallback(() => fn(), [deps])` | Compiler stabilizes function references automatically | Remove it; define the function inline or at module level |
| `React.memo(Component)` | Compiler skips re-renders automatically when props haven't changed | Remove wrappers; let compiler decide |

**Only keep `useMemo`/`useCallback`** for semantically meaningful cases: expensive computations that are intentionally opt-in, or when interfacing with non-React libraries that rely on referential stability.

---

## 2. Folder Structure

Co-locate files by feature, not by type. Grouping all hooks in one folder and all components in another scales poorly — you end up hunting across the tree for related files.

```
src/
├── app/                        # Next.js App Router pages & layouts
├── components/
│   └── ui/                     # shadcn/ui primitives (don't edit these)
├── features/
│   └── invoices/
│       ├── components/         # UI components for this feature
│       ├── hooks/              # useInvoices, useCreateInvoice, etc.
│       ├── atoms.ts            # Jotai atoms scoped to this feature
│       └── types.ts            # Types scoped to this feature
├── lib/
│   └── api.ts                  # Raw fetch/axios wrappers
└── types/                      # Shared global types
```

**Rules:**

- Feature folders own everything related to that domain
- Shared, reusable UI goes in `components/ui/`
- Only promote something to `lib/` or `types/` when it's genuinely used across multiple features
- Query hooks live next to the feature they belong to, not in a global `hooks/` folder

---

## 3. Naming Conventions

Consistent naming makes the codebase scannable without reading implementation details.

**Use descriptive, intention-revealing names.** A name should tell you what the value represents and when/why it exists — not just its type.

```tsx
// ❌ Vague — what is this? when is it true?
const updated = true;
const data = [];
const flag = false;
const result = await fetch(...);

// ✅ Descriptive — self-documenting
const stateAfterRecurringDataUpdated = true;
const pendingInvoices = [];
const isPaymentProcessing = false;
const updatedUserProfile = await updateProfile(...);
```

The name should make a comment unnecessary. If you feel the urge to add a comment explaining what a variable is, rename it instead.

---

**Always add JSDoc comments to helper and utility functions.** Components and hooks are self-explanatory from their name and usage, but utility functions often have non-obvious logic, edge cases, or expected input shapes that benefit from documentation.

```tsx
// ❌ No context — what does this accept? what does it return? any edge cases?
function calculateDiscount(price, user) {
  ...
}

// ✅ JSDoc documents intent, params, return value, and edge cases
/**
 * Calculates the final discounted price for a user based on their subscription tier.
 * Returns the original price if no discount applies or if the user has no active plan.
 *
 * @param price - The original price in cents
 * @param user - The user object including their current subscription tier
 * @returns The discounted price in cents
 */
function calculateDiscount(price: number, user: User): number {
  ...
}
```

**When to always add JSDoc:**

- Pure utility/helper functions (`lib/`, `utils/`)
- Functions with non-obvious parameters or return shapes
- Functions with edge cases or important constraints
- Shared functions used across multiple features

**When JSDoc is optional:**

- Simple one-liner helpers where the name says everything
- Internal component helpers that are only used once

| Thing              | Convention                  | Example                          |
| ------------------ | --------------------------- | -------------------------------- |
| Components         | PascalCase                  | `UserCard`, `InvoiceTable`       |
| Query hooks        | `use` + resource            | `useUser`, `usePosts`            |
| Mutation hooks     | `use` + verb + resource     | `useCreatePost`, `useDeleteUser` |
| Event handlers     | `handle` + event            | `handleSubmit`, `handleDelete`   |
| Booleans           | `is` / `has` / `can` prefix | `isOpen`, `hasError`, `canEdit`  |
| Atoms (Jotai)      | camelCase + `Atom` suffix   | `userAtom`, `sidebarOpenAtom`    |
| Types / interfaces | PascalCase                  | `User`, `PostInput`              |

---

## 4. Component Design

**❌ Antipattern — Prop drilling through many layers**

```tsx
<A user={user}>
  <B user={user}>
    <C user={user} />
  </B>
</A>
```

Props passed through components that don't use them creates tight coupling and fragile trees. Use **Jotai** for shared values.

**✅ Preferred**

```tsx
// atoms.ts
export const userAtom = atom<User | null>(null);

// Any component, anywhere in the tree
const [user, setUser] = useAtom(userAtom);
```

Jotai atoms are global by default, co-locatable with the feature they belong to, and only re-render components that subscribe to that specific atom — no Provider nesting required.

---

**Component Size & Splitting**

A component should do one thing well. When a component grows too large — hard to scan, multiple unrelated concerns, deeply nested JSX — split it.

**Signs a component needs to be split:**

- It handles fetching, transformation, and rendering all at once
- It has many unrelated pieces of state
- Parts of its JSX could meaningfully stand alone
- It's hard to understand without reading the whole thing

**✅ Distribute responsibilities clearly**

```tsx
// ❌ One component doing too much
function Dashboard() {
  const { data: user } = useUser(id);
  const { data: stats } = useStats(id);
  // ...lots of state, lots of JSX
}

// ✅ Split into focused components, each owning its concern
function Dashboard() {
  return (
    <div>
      <UserHeader userId={id} />
      <StatsPanel userId={id} />
    </div>
  );
}
```

Each child calls its own query hook — no prop passing, clean separation.

**But don't split for the sake of splitting.** If breaking a component apart requires passing many props down, adds indirection without clarity, or makes the logic harder to follow — keep it together. Splitting is a tool, not a rule. The goal is readability and maintainability, not a low line count.

---

## 5. TypeScript Patterns

- Type component props with `type`, not `interface` — `interface` is for object shapes and contracts; `type` is more flexible and consistent for props.
- Prefer explicit return types on complex components.
- Use discriminated unions for conditional props instead of optional everything.

```tsx
// ❌ Vague
type Props = { href?: string; onClick?: () => void; }

// ✅ Explicit intent
type Props =
  | { as: 'a'; href: string }
  | { as: 'button'; onClick: () => void };
```

---

## 6. `"use client"` Boundaries

In Next.js App Router, every component is a Server Component by default. `"use client"` marks a boundary where the component and everything it imports becomes client-side. Placing it too high wastes this advantage.

**❌ Antipattern — `"use client"` at the top of a large file**

```tsx
"use client"; // entire tree is now client-side

export default function ProductPage() {
  // static content, server-fetched data, AND one interactive button
}
```

**✅ Preferred — push the boundary as deep as possible**

```tsx
// ProductPage.tsx — Server Component, no directive needed
export default function ProductPage() {
  return (
    <div>
      <ProductDetails />   {/* stays server */}
      <AddToCartButton />  {/* only this is client */}
    </div>
  );
}

// AddToCartButton.tsx
"use client";
export function AddToCartButton() {
  const [added, setAdded] = useState(false);
  // ...
}
```

**Rules:**

- Only add `"use client"` when you need interactivity: `useState`, `useEffect`, event handlers, browser APIs
- Server Components can import Client Components — not the other way around
- Data fetching belongs in Server Components when possible; use `useQuery` in Client Components when you need client-side reactivity

---

## 7. State Management

**❌ Antipattern — Derived state in `useState`**

```tsx
const [fullName, setFullName] = useState(`${first} ${last}`);
```

Derived state gets stale. When `first` or `last` changes you need extra sync logic.

**✅ Preferred** — Compute derived values inline (compiler memoizes it):

```tsx
const fullName = `${first} ${last}`;
```

---

**❌ Antipattern — `useEffect` to sync state with state**

```tsx
useEffect(() => {
  setFiltered(items.filter(x => x.active));
}, [items]);
```

This triggers an extra render cycle for no reason.

**✅ Preferred** — Derive during render:

```tsx
const filtered = items.filter(x => x.active);
```

---

**❌ Antipattern — `useEffect` for event-driven logic**

```tsx
useEffect(() => {
  if (submitted) sendForm();
}, [submitted]);
```

Effects are for synchronizing with external systems, not reacting to events.

**✅ Preferred** — Put logic directly in the event handler:

```tsx
function handleSubmit() {
  sendForm();
  setSubmitted(true);
}
```

---

## 8. Refs

**❌ Antipattern — Storing values in refs to "skip renders"**

```tsx
const countRef = useRef(0);
countRef.current += 1; // mutate to avoid re-render
```

Breaks the React data model. The UI won't reflect the value and it confuses the compiler.

**✅ Preferred** — Use `useRef` only for:

- DOM node references
- Mutable values that genuinely must not trigger re-renders (e.g. timers, subscriptions)

---

## 9. Effects & Cleanup

**❌ Antipattern — Effects without cleanup for subscriptions/timers**

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  // missing: return () => clearInterval(id)
}, []);
```

Leaks memory and causes bugs in Strict Mode (which mounts/unmounts twice in dev).

**✅ Preferred** — Always return a cleanup function:

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

---

## 10. Conditional Rendering

**❌ Antipattern — using `&&` for conditional rendering**

```tsx
{count && <List />}
{items.length && <List />}
```

When `count` or `items.length` is `0`, React renders the number `0` in the UI instead of nothing. A common and silent bug.

**✅ Preferred — always use ternary with explicit `null`**

```tsx
{count ? <List /> : null}
{items.length > 0 ? <List /> : null}
```

Explicit, predictable, and no accidental renders of falsy values.

---

## 11. Data Fetching

**❌ Antipattern — `useEffect` + `useState` for fetching**

```tsx
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);
```

No loading state, no error handling, no deduplication, no caching, race conditions on fast navigation.

**✅ Preferred** — Always use `useQuery` from TanStack Query, wrapped in a reusable hook — one hook per data resource, defined once, used anywhere:

```tsx
// hooks/useUser.ts
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });
}
```

Handles caching, deduplication, background refetching, loading and error states automatically.

---

**❌ Antipattern — passing fetched data down as props to avoid re-fetching**

```tsx
function ParentPage() {
  const { data: user } = useUser(id);
  return <UserAvatar user={user} />;      // passing data as prop
}

function UserAvatar({ user }: { user: User }) { ... }
```

**✅ Preferred — call the hook directly inside the child component**

```tsx
function ParentPage() {
  return <UserAvatar userId={id} />;
}

function UserAvatar({ userId }: { userId: string }) {
  const { data: user } = useUser(userId); // reads from cache, zero extra requests
}
```

Because TanStack Query caches by `queryKey`, calling the same hook in multiple components makes **zero extra network requests** — the child reads from cache instantly. This eliminates prop drilling for server data entirely, keeps components self-contained. Never pass server data as props when a reusable query hook exists — just call the hook.

---

## 12. Loading & Error States

Every `useQuery` call exposes `isPending` and `isError` — always handle both explicitly, never ignore them.

**❌ Antipattern — rendering data without handling loading/error**

```tsx
function UserCard({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  return <div>{user.name}</div>; // crashes if data isn't ready
}
```

**✅ Preferred — handle all three states**

```tsx
function UserCard({ userId }: { userId: string }) {
  const { data: user, isPending, isError } = useUser(userId);

  if (isPending) return <UserCardSkeleton />;
  if (isError) return <ErrorMessage />;

  return <div>{user.name}</div>;
}
```

---

### 12.1 Skeletons over Spinners

**❌ Avoid spinners for content that has a known shape**

```tsx
if (isPending) return <Spinner />;
```

Spinners cause layout shift — the UI jumps from a small spinner to a full card/list. They also feel slower than they are because the user has no sense of what's coming.

**✅ Use skeleton loaders that match the shape of the real content**

If shadcn/ui is installed, always prefer its `Skeleton` component — it handles the pulse animation and theming automatically:

```tsx
function UserCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />   {/* name */}
      <Skeleton className="h-3 w-24" />   {/* subtitle */}
    </div>
  );
}
```

The skeleton mirrors the layout of the loaded component so the page feels stable and the transition is seamless.

**Spinners are acceptable for:**

- Small components like buttons — there's no shape to mirror and the context is clear
- Actions (form submit, button click) where feedback is needed inline
- Full-page navigations or indeterminate background tasks

```tsx
<Button disabled={isPending}>
  {isPending ? <Spinner className="h-4 w-4" /> : 'Save'}
</Button>
```

---

### 12.2 Error States

Don't let errors silently fail or show raw messages. Give the user context and a way out:

```tsx
function ErrorMessage({ retry }: { retry: () => void }) {
  return (
    <div>
      <p>Something went wrong.</p>
      <button onClick={retry}>Try again</button>
    </div>
  );
}

// In the component
if (isError) return <ErrorMessage retry={refetch} />;
```

`refetch` is returned by `useQuery` and re-triggers the query — pass it directly to the error UI.

---

### 12.3 Empty States

When a query succeeds but returns no data or an empty list, handle it as a distinct state — don't let the UI silently render nothing.

**❌ Antipattern — ignoring the empty case**

```tsx
if (isPending) return <Skeleton />;
if (isError) return <ErrorMessage retry={refetch} />;

return (
  <ul>
    {items.map(item => <Item key={item.id} {...item} />)}
  </ul>
  // renders an empty <ul> with no feedback to the user
);
```

**✅ Preferred — explicit empty state**

```tsx
if (isPending) return <ListSkeleton />;
if (isError) return <ErrorMessage retry={refetch} />;
if (!items.length) return <EmptyState />;

return (
  <ul>
    {items.map(item => <Item key={item.id} {...item} />)}
  </ul>
);
```

A good empty state tells the user **why** it's empty and **what they can do** about it:

```tsx
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
      <p>No items found.</p>
      <Button variant="outline" onClick={...}>Create one</Button>
    </div>
  );
}
```

The four states to always account for in data-driven components: **loading → error → empty → data**.

---

## 13. Mutations & Cache Invalidation

For any write operation (POST, PUT, DELETE), use `useMutation` from TanStack Query — never fire a raw `fetch` inside an event handler.

**✅ Wrap mutations in a reusable hook, just like queries**

```tsx
// hooks/useCreatePost.ts
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

```tsx
// In a component
function NewPostForm() {
  const { mutate, isPending } = useCreatePost();

  return (
    <Button onClick={() => mutate(formData)} disabled={isPending}>
      {isPending ? <Spinner className="h-4 w-4" /> : 'Create Post'}
    </Button>
  );
}
```

**After a successful mutation, always invalidate the relevant query** so the UI reflects the new state without a manual refetch or stale data.

- `onSuccess` — invalidate or update cache
- `onError` — show an error toast or inline message
- `isPending` — disable the trigger button and show a spinner

---

## 14. Form Handling — TanStack Form + shadcn/ui

For all forms, use **TanStack Form** with **Zod** for validation. If shadcn/ui is installed, use its `<Field />` component family for accessible, consistently styled field layouts.

> **Zod imports:** Always import from `"zod/v4"` and import only the validators you need — never `import * as z from "zod"`.

> shadcn's `<Field />` is form-library-agnostic — it handles labels, descriptions, and error display. TanStack Form handles state, validation, and submission. They compose together cleanly.

---

### 1. Define the schema first with Zod

```tsx
import { z, string, object, email } from "zod/v4" // import only what you need

import { object, string } from "zod/v4"

const schema = object({
  email: string().email("Enter a valid email."),
  password: string().min(8, "Password must be at least 8 characters."),
})
```

Single source of truth — drives both validation and TypeScript types.

---

### 2. Set up the form with `useForm`

```tsx
"use client"
import { useForm } from "@tanstack/react-form"

const form = useForm({
  defaultValues: { email: "", password: "" },
  validators: {
    onSubmit: schema,   // validate on submit
    onChange: schema,   // validate in real-time as user types (optional)
  },
  onSubmit: async ({ value }) => {
    await createUser(value); // tie directly to your useMutation or server action
  },
})
```

**Validation strategies:**

- `onSubmit` — validate only on submit (least noisy, good default)
- `onChange` — real-time feedback as the user types
- `onBlur` — validate when the user leaves a field (good middle ground)

---

### 3. Render fields using shadcn `<Field />` + `form.Field`

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

<form
  onSubmit={(e) => {
    e.preventDefault()
    form.handleSubmit()
  }}
>
  <FieldGroup>
    <form.Field name="email">
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
            />
            <FieldDescription>We'll never share your email.</FieldDescription>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        )
      }}
    </form.Field>
  </FieldGroup>

  <Button type="submit" disabled={form.state.isSubmitting}>
    {form.state.isSubmitting ? <Spinner className="h-4 w-4" /> : "Submit"}
  </Button>
</form>
```

---

### 4. Tie submission to `useMutation`

Don't fetch inside `onSubmit` directly — use your mutation hook so the cache stays in sync:

```tsx
const { mutateAsync } = useCreateUser();

const form = useForm({
  defaultValues: { email: "", password: "" },
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    await mutateAsync(value);
  },
})
```

---

### 14.5 Key rules

- **Always show `FieldError`** — errors must be visible next to the field, not only in a toast
- **Always disable the submit button** while `form.state.isSubmitting` is true
- **Use `data-invalid`** on `<Field>` so shadcn styles the field border and label color automatically
- **Don't use `<form>` HTML element with `action=`** in client components — use `onSubmit` + `e.preventDefault()` + `form.handleSubmit()`
- **Errors are arrays** — `field.state.meta.errors` is `string[]`, `<FieldError>` accepts this directly

## 15. Keys & Lists

**❌ Antipattern — Index as key**

```tsx
items.map((item, i) => <Row key={i} {...item} />)
```

When list order changes, React reuses the wrong DOM nodes causing bugs and lost state.

**✅ Preferred** — Always use a stable, unique identifier:

```tsx
items.map(item => <Row key={item.id} {...item} />)
```

---

## 16. Accessibility Basics

Accessibility is not optional. These are the minimum non-negotiables:

**Use semantic HTML** — don't reach for `<div>` when a proper element exists:

```tsx
// ❌
<div onClick={handleSubmit}>Submit</div>

// ✅
<button onClick={handleSubmit}>Submit</button>
```

**Always label interactive elements:**

```tsx
// ❌ Icon-only button with no label
<button><TrashIcon /></button>

// ✅
<button aria-label="Delete item"><TrashIcon /></button>
```

**Images need alt text:**

```tsx
// ❌
<img src={user.avatar} />

// ✅ Meaningful image
<img src={user.avatar} alt={`${user.name}'s avatar`} />

// ✅ Decorative image
<img src={decorativeBanner} alt="" />
```

**Never remove focus outlines without replacing them** — keyboard users rely on them entirely.

**Color alone must never convey meaning** — pair it with an icon, label, or pattern for error/success states.

---

## 17. General Rules

- **Co-locate state** as close to where it's used as possible. Lift only when sharing is required.
- **Avoid `any`** — use `unknown` and narrow types explicitly.
- **Prefer composition over configuration** — small focused components over a single component with 15 props controlling its behavior.
- **Keep effects minimal** — if you reach for `useEffect`, ask: is this synchronizing with an external system? If not, there's likely a better place for this logic.

---
