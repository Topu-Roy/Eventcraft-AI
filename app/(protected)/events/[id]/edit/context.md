# Event Edit Route Context

## Route: `/events/[id]/edit`

### Purpose

Edit an existing event's details. Uses TanStack Form + Zod v4 + shadcn Field for full validation.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/events/[id]/edit/page.tsx
```

### Key Components

| Component       | File                                           | Type   |
| --------------- | ---------------------------------------------- | ------ |
| `EventEditForm` | `features/events/components/EventEditForm.tsx` | Client |

### Form Schema

- `features/events/schemas.ts` — Zod v4 schema (`eventEditSchema`)
- Validates: title (3-200 chars), description (10-5000 chars), category (required), venue (all fields required), dates (required), capacity (optional, min 1)
- `EventEditInput` type exported from schema

### Convex Functions Used

- `api.events.getById` — query, returns event if user is organizer/co-organizer
- `api.events.update` — mutation, partial update, validates organizer access
- `api.events.publish` — mutation, publishes draft
- `api.events.cancel` — mutation, cancels published event
- `api.categories.list` — query, all categories for select

### Authorization

- Only organizer or co-organizers can edit
- `api.events.getById` returns null if no access → page shows loading then null
- `api.events.update` returns `{ error: true, cause: "Not authorized" }` if no access

### Form Behavior

- `onChange` validation with Zod schema
- `data-invalid` styling via shadcn `<Field />`
- Inline `FieldError` per field
- Submit button in header triggers form via `form="edit-event-form"`
- Cover photo display only (editing disabled, placeholder note shown)
- Tags managed via dynamic array (add/remove empty inputs)

### Actions

- **Save** — updates event, shows toast on success/error
- **Publish** — (draft only) publishes event, redirects to event detail
- **Cancel Event** — (published only) shows AlertDialog confirmation, cancels event

### Edge Cases

- Event not found → loading skeleton, then null
- Unauthorized → null (AuthGuard handles redirect)
- Validation errors → inline field errors, no submission
- Cover photo uses existing event's cover (no editing yet)
