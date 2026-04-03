# Organizer Dashboard - Context

## Route

`/organizer/dashboard`

## Purpose

Server-rendered dashboard for event organizers showing KPIs, registration analytics, and earnings placeholder.

## Features

- Event selector dropdown to switch between events
- 4 KPI cards: Total Registered, Checked In, Engagement Rate, Capacity Remaining
- Registration timeline area chart placeholder
- Earnings card: "Ticket Sales — coming with paid events"
- Empty state when no events exist with "Create Event" CTA

## Convex Queries Used

- `api.events.getMyEvents`: Get organizer's events for dropdown
- `api.checkin.getEventAnalytics`: Get analytics for selected event

## Components

- `EventSelector`: Client component with dropdown and Suspense boundary
- `DashboardContent`: Client component showing KPIs and charts
- Server page component with empty state handling

## Key Logic

- If no events: show empty state with create event CTA
- If events exist: show event selector and analytics
- Analytics loading state handled by Suspense + Skeleton
