# Organizer Dashboard Route Context

## Route: `/dashboard`

### Purpose

Organizer overview showing all events, KPIs, and quick access to event management.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/dashboard/page.tsx
```

### Key Components

| Component          | File                                                 | Type   |
| ------------------ | ---------------------------------------------------- | ------ |
| `EventSummaryCard` | `app/(protected)/dashboard/page.tsx`                 | Server |
| `EventSelector`    | `features/events/components/EventSelector.tsx`       | Server |
| `DashboardContent` | `features/analytics/components/DashboardContent.tsx` | Server |

### Convex Functions Used

- `api.events.getMyEvents` — query, returns all events organized + co-organized
- `api.events.getPlanUsage` — query, returns plan info + event count

### Event Status Badges

- Draft → secondary
- Published → default
- Completed → outline
- Cancelled → destructive
- Past → additional "Ended" badge

### KPI Cards

- Active events count
- Total registrations across all events
- All events count
- Plan usage (X of Y events used)

### Empty State

- No events → "No events yet" with "Create Event" CTA

### Layout

- Header with plan usage indicator + Create Event button
- 3-column KPI grid
- Event list in 2-column grid
- Each event card links to edit page

### Edge Cases

- No events → empty state with CTA
- Network error → error boundary
- Plan limit reached → visual indicator in header
