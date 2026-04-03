# Ticket Detail Page - Context

## Route

`/tickets/[ticketCode]`

## Purpose

Full-screen ticket display designed for phone screens with QR code, event info, and cancel option.

## Features

- Full-screen ticket display optimized for mobile
- Large QR code using qrcode library (SVG output)
- Screen Wake Lock API to keep screen on during check-in
- Cancel registration button (hidden within 1hr of event)
- Loading and empty states
- Back navigation

## Convex Queries Used

- `api.registrations.getByTicketCode`: Get registration and event by ticket code

## Convex Mutations Used

- `api.registrations.cancelRegistration`: Cancel registration

## Key APIs

- `qrcode` library for SVG QR code generation
- `navigator.wakeLock` (Screen Wake Lock API) for keeping screen on
- Visibility change listener to re-acquire wake lock

## Cancel Logic

- Cancel button hidden if within 1 hour of event start
- Cancel button hidden if registration is not active
