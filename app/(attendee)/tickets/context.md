# My Tickets Page - Context

## Route

`/tickets`

## Purpose

Lists all of the user's event registrations with ticket info and links to full ticket view.

## Features

- Grid of ticket cards with cover photo, event title, date, venue
- Check-in status badge (Checked In / Active)
- "View Ticket" button linking to full ticket display
- Empty state with link to explore events
- Loading skeletons

## Convex Queries Used

- `api.registrations.getMyRegistrations`: Get user's registrations with event data

## Components

- `TicketCard`: Individual ticket with event info
- `TicketList`: Server component fetching and rendering tickets
- Empty state with `Empty` component from shadcn/ui
