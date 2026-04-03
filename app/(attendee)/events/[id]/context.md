# Event Detail Page - Context

## Route

`/events/[id]`

## Purpose

Server-rendered event detail page with SEO-friendly rendering, access control, and registration CTA.

## Features

- Server-rendered for SEO
- Access control: draft→404, cancelled→desaturated state, past→"ended" badge
- Registration CTA states: Register, View My Ticket, Event Full, Ended, Manage Event
- Sticky sidebar on desktop, fixed bottom bar on mobile
- Event info: date, time, venue, capacity
- Full description rendering

## Convex Queries Used

- `api.discovery.getEventDetail`: Get event with organizer and registration info
- `api.events.getById`: Get event for sidebar (organizer access check)

## Components

- `EventHeader`: Cover photo with status badges
- `EventInfo`: Date, time, venue, capacity details
- `EventDescription`: Full event description
- `RegistrationCTA`: Client component with registration logic
- `EventSidebar`: Sticky sidebar with registration CTA

## Access Control

- Draft events return 404 via `notFound()`
- Cancelled events show desaturated state with "Cancelled" badge
- Completed/past events show "Ended" badge
