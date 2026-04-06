# Ticket Detail Route Context

## Route: `/tickets/[ticketCode]`

### Metadata

- **Title:** `{event.title} Ticket — EventCraft AI` (dynamic)
- **Description:** Your ticket for {event.title}

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/tickets/[ticketCode]/page.tsx
```

### Convex Functions

- `api.registrations.getByTicketCode` — registration + event by code
- `api.registrations.cancelRegistration` — cancel (if > 1hr before event)

### Features

- QR code (SVG via `qrcode`)
- Screen Wake Lock
- Cancellation hidden within 1hr of event
- Status badges: Active, Checked In, Cancelled

### Layout

- Centered card, event cover background
- Large QR code
- Event details: title, date, time, venue

### Edge Cases

- Ticket not found → error state
- Wrong profile → null
- Event cancelled → desaturated
- Within 1hr → cancel hidden
