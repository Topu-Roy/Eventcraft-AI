# QR Scanner Page - Context

## Route

`/organizer/scanner/[eventId]`

## Purpose

Client component for scanning attendee QR codes to check them in at events.

## Features

- Camera access via @zxing/browser
- Camera permission states: granted, denied, dismissed
- Decode deduplication (ref tracking last code + timestamp, 3s ignore window)
- Three outcomes: success (green), already checked in (yellow), invalid (red)
- Manual code input fallback tab
- Auto-reset timing toggle (Standard 3s / Fast 1.5s) in localStorage
- Settings panel for scanner configuration

## Convex Mutations Used

- `api.checkin.checkIn`: Check in attendee by ticket code
- `api.checkin.manualCheckIn`: Manual check in by typed code

## Dependencies

- @zxing/browser for QR code scanning
- qrcode for QR display (not used here, used in ticket detail)
- localStorage for settings persistence

## Key Logic

- `lastScanRef` Map tracks code -> timestamp for deduplication
- Auto-reset window configurable: 3000ms (standard) or 1500ms (fast)
- Camera permission state persisted to localStorage
