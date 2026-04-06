# QR Scanner Route Context

## Route: `/scanner/[eventId]`

### Metadata

- **Title:** Check-In Scanner — EventCraft AI
- **Description:** Scan attendee tickets for quick check-in.

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/scanner/layout.tsx
              └── app/(protected)/scanner/[eventId]/page.tsx
```

### Convex Functions

- `api.checkin.checkIn` — mutation, checks in by ticket code
- `api.checkin.manualCheckIn` — mutation, manual entry

### Check-In Outcomes

- **Success** (green) → "Checked in: {name}"
- **Already checked in** (yellow) → "Already checked in"
- **Invalid** (red) → reason (not found, wrong event, cancelled, unauthorized)

### Camera States

- Granted → live video feed
- Denied → "Camera access denied" + "Try Again"
- Dismissed → "No camera found"

### Deduplication

- Same code within 3s ignored

### Settings

- Auto-reset toggle: 3s / 1.5s (localStorage)

### Edge Cases

- No permission → manual entry
- Wrong event → "invalid"
- Cancelled registration → result shown
