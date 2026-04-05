# My Tickets Route Context

## Route: `/tickets`

### Purpose

Dashboard showing all of the profile's event registrations with status, venue info, and quick actions.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/tickets/page.tsx
```

### Key Components

| Component            | File                               | Type   |
| -------------------- | ---------------------------------- | ------ |
| `TicketCard`         | `app/(protected)/tickets/page.tsx` | Server |
| `TicketCardSkeleton` | `app/(protected)/tickets/page.tsx` | Server |
| `TicketsEmptyState`  | `app/(protected)/tickets/page.tsx` | Server |
| `TicketList`         | `app/(protected)/tickets/page.tsx` | Server |

### Convex Functions Used

- `api.registrations.getMyRegistrations` — query, returns all registrations with event data

### Ticket States

- **Active + upcoming** → full card with "View Ticket" + event link
- **Active + starting soon** (< 1hr) → "Starting soon" badge (pulsing)
- **Active + past** → "Ended" overlay on cover
- **Checked in** → "Checked In" badge (default variant)
- **Cancelled** → "Cancelled" badge (destructive), disabled ticket button

### Empty State

- Shows when no registrations exist
- "No tickets yet" message
- "Explore Events" CTA button

### Layout

- Responsive grid: 1 col → 2 cols (sm) → 3 cols (lg)
- Header with active/total counts
- Suspense boundary with skeleton fallback

### Edge Cases

- Event data missing → filtered out
- Network error → error boundary (from Suspense)
- Empty list → empty state with CTA
