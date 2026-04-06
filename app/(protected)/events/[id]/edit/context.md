# Event Edit Route Context

## Route: `/events/[id]/edit`

### Metadata

- **Title:** Edit `{event.title} — EventCraft AI` (dynamic)
- **Description:** Edit event details for {event.title}

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/events/[id]/edit/page.tsx
```

### Key Components

| Component       | File                                           | Type   |
| --------------- | ---------------------------------------------- | ------ |
| `EventEditForm` | `features/events/components/EventEditForm.tsx` | Client |

### Form Schema

- `features/events/schemas.ts` — Zod v4 (`eventEditSchema`)
- title (3-200), description (10-5000), category, venue, dates, capacity

### Convex Functions

- `api.events.getById` — event if organizer/co-organizer
- `api.events.update` — partial update
- `api.events.publish` — publish draft
- `api.events.cancel` — cancel event
- `api.categories.list` — categories for select

### Authorization

- Only organizer/co-organizers can edit

### Actions

- **Save** — updates event
- **Publish** — (draft only) publishes
- **Cancel Event** — (published only) cancels

### Edge Cases

- Event not found → loading, then null
- Unauthorized → null
- Validation errors → inline errors
- Cover photo display only
