# Check-in Redirect Page - Context

## Route

`/check-in/[ticketCode]`

## Purpose

Public page that redirects authenticated organizers to the scanner, or shows ticket info for attendees.

## Features

- If authenticated: redirects to scanner with ticket code
- If unauthenticated: shows ticket code display with sign-in prompt for organizers
- Public access (no auth guard)

## Auth Logic

- `isAuthenticated()` check from auth-server
- Redirect to `/organizer/scanner?code=${ticketCode}` if authenticated
- Show static ticket info card if not authenticated
