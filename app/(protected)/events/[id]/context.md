# Event Detail Route Context

## Route: `/events/[id]`

### Metadata

- **Title:** `{event.title} — EventCraft AI` (dynamic)
- **Description:** First 160 chars of event description

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/events/[id]/page.tsx
```

### Key Components

| Component         | File                                             | Type   |
| ----------------- | ------------------------------------------------ | ------ |
| `EventHeader`     | `app/(protected)/events/[id]/page.tsx`           | Server |
| `RegistrationCTA` | `features/events/components/RegistrationCTA.tsx` | Client |

### Convex Functions

- `api.discovery.getEventDetail` — event + organizer + isOrganizer + isRegistered
- `api.registrations.register` — mutation

### Access Control

- Draft → 404 for non-organizers
- Cancelled → desaturated cover, "Cancelled" badge
- Past → "Ended" badge
- Published → full detail

### Registration CTA

- Organizer → "Manage Event"
- Already registered → "View My Ticket"
- Full → "Event Full" (disabled)
- Past → "Event Ended" (disabled)
- Cancelled → "Event Cancelled" (disabled)
- Default → "Register"

### Layout

- Desktop: 2-column (content + sticky sidebar)
- Mobile: single column + fixed bottom CTA

### Edge Cases

- Event not found → `notFound()`
- Draft for non-organizer → `notFound()`
- Registration fails → toast error
