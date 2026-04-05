# Event Detail Route Context

## Route: `/events/[id]`

### Purpose

Server-rendered event detail page with access control, registration CTA, and organizer actions.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/events/[id]/page.tsx
```

### Key Components

| Component          | File                                             | Type   |
| ------------------ | ------------------------------------------------ | ------ |
| `EventHeader`      | `app/(protected)/events/[id]/page.tsx`           | Server |
| `EventDescription` | `app/(protected)/events/[id]/page.tsx`           | Server |
| `EventSidebar`     | `app/(protected)/events/[id]/page.tsx`           | Server |
| `RegistrationCTA`  | `features/events/components/RegistrationCTA.tsx` | Client |

### Convex Functions Used

- `api.discovery.getEventDetail` — query, returns event + organizer + isOrganizer + isRegistered
- `api.events.getById` — query, used by sidebar for full event data
- `api.registrations.register` — mutation, registers profile for event

### Access Control States

- **Draft** → 404 for non-organizers
- **Cancelled** → desaturated cover, "Cancelled" badge
- **Past** → "Ended" badge
- **Published** → full detail with registration CTA

### Registration CTA States

- Organizer → "Manage Event" button (links to edit)
- Already registered → "View My Ticket" button
- Event full → "Event Full" (disabled)
- Event past → "Event Ended" (disabled)
- Event cancelled → "Event Cancelled" (disabled)
- Default → "Register" button

### Layout

- Desktop: 2-column grid (content + sticky sidebar)
- Mobile: single column + fixed bottom CTA bar

### ID Validation

- Convex IDs start with "j" — non-ID params (like "create") trigger `notFound()`

### SEO

- OG meta tags for title, description, cover photo
- Server-rendered for crawler accessibility

### Edge Cases

- Event not found → `notFound()`
- Draft event for non-organizer → `notFound()`
- Registration fails (capacity, already registered) → toast error
