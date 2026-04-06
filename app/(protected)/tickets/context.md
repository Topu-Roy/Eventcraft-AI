# My Tickets Route Context

## Route: `/tickets`

### Metadata

- **Title:** My Tickets — EventCraft AI
- **Description:** Your event tickets. QR-coded. Always in your pocket.

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/tickets/page.tsx
```

### Key Components

| Component    | File                               | Type   |
| ------------ | ---------------------------------- | ------ |
| `TicketCard` | `app/(protected)/tickets/page.tsx` | Server |

### Convex Functions

- `api.registrations.getMyRegistrations` — all registrations with event data

### Ticket States

- Active + upcoming → "View Ticket" button
- Starting soon (< 1hr) → "Starting soon" badge
- Past → "Ended" overlay
- Checked in → "Checked In" badge
- Cancelled → "Cancelled" badge, disabled button

### Empty State

- No tickets → "No tickets yet" + "Explore Events" CTA
