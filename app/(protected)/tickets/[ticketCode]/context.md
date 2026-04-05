# Ticket Detail Route Context

## Route: `/tickets/[ticketCode]`

### Purpose

Full-screen ticket display designed for phone screens. Shows QR code, event info, and cancellation option.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/tickets/[ticketCode]/page.tsx
```

### Key Components

| Component      | File                                            | Type   |
| -------------- | ----------------------------------------------- | ------ |
| `TicketDetail` | `app/(protected)/tickets/[ticketCode]/page.tsx` | Client |

### Convex Functions Used

- `api.registrations.getByTicketCode` — query, returns registration + event by ticket code
- `api.registrations.cancelRegistration` — mutation, cancels registration (if > 1hr before event)

### Features

- **QR Code** — generated with `qrcode` library, rendered as SVG
- **Screen Wake Lock** — keeps screen on while viewing ticket
- **Cancellation** — hidden within 1 hour of event start
- **Status badges** — Active, Checked In, Cancelled

### Layout

- Centered card with event cover photo background
- Large QR code for scanning
- Event details: title, date, time, venue
- Cancel registration button (conditional)

### Edge Cases

- Ticket not found → error state
- Registration belongs to different profile → null (not authorized)
- Event cancelled → desaturated display
- Within 1hr of event → cancel button hidden
