# QR Scanner Route Context

## Route: `/scanner/[eventId]`

### Purpose

Camera-based QR code scanner for event check-in with manual code fallback.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/scanner/[eventId]/page.tsx
```

### Key Components

| Component                | File                                         | Type   |
| ------------------------ | -------------------------------------------- | ------ |
| `ScannerResultBanner`    | `app/(protected)/scanner/[eventId]/page.tsx` | Client |
| `ScannerSettingsPanel`   | `app/(protected)/scanner/[eventId]/page.tsx` | Client |
| `ScannerCameraView`      | `app/(protected)/scanner/[eventId]/page.tsx` | Client |
| `ScannerManualEntryForm` | `app/(protected)/scanner/[eventId]/page.tsx` | Client |

### Convex Functions Used

- `api.checkin.checkIn` — mutation, checks in attendee by ticket code
- `api.checkin.manualCheckIn` — mutation, same as checkIn but for manual entry

### Check-In Outcomes

- **Success** (green) → "Checked in: {name}"
- **Already checked in** (yellow) → "Already checked in"
- **Invalid** (red) → reason (ticket not found, wrong event, cancelled, unauthorized)

### Camera States

- **Granted** → live video feed with scan overlay
- **Denied** → "Camera access denied" with "Try Again" button
- **Dismissed** → "No camera found" message
- **Not started** → "Start Camera" button

### Deduplication

- `lastScanRef` tracks last scan timestamp per ticket code
- Same code within `autoResetMs` (default 3s) is ignored
- Prevents double check-ins from continuous camera scanning

### Manual Entry

- Tab-based fallback when camera unavailable
- Text input for ticket code
- Same check-in mutation path as camera

### Settings

- Auto-reset timing toggle: Standard (3s) / Fast (1.5s)
- Stored in `localStorage` for persistence

### Edge Cases

- No camera permission → manual entry tab active
- Ticket belongs to different event → "invalid" result
- Organizer not authorized → "Not authorized" result
- Registration cancelled → "Registration cancelled" result
