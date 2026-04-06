# Organizer Dashboard Route Context

## Route: `/dashboard`

### Metadata

- **Title:** Dashboard — EventCraft AI
- **Description:** Your events. Your metrics. All in one place.

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/dashboard/page.tsx
```

### Key Components

| Component          | File                                                 | Type   |
| ------------------ | ---------------------------------------------------- | ------ |
| `EventSelector`    | `features/events/components/EventSelector.tsx`       | Server |
| `DashboardContent` | `features/analytics/components/DashboardContent.tsx` | Server |

### Convex Functions

- `api.events.getMyEvents` — all events organized + co-organized
- `api.events.getPlanUsage` — plan info + event count

### Status Badges

- Draft → secondary
- Published → default
- Completed → outline
- Cancelled → destructive

### KPIs

- Active events
- Total registrations
- All events
- Plan usage

### Empty State

- No events → "No events yet" + "Create Event" CTA
