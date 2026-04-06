# EventCraft AI — Architecture & Implementation

---

## Brand

- **Name:** EventCraft AI
- **Tagline:** "Events, at the speed of thought."
- **Description:** AI-powered event creation. From prompt to published in seconds.

---

## Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, React 19
- **Backend:** Convex (database, server functions, actions)
- **Auth:** BetterAuth with Convex adapter + admin plugin
- **AI:** Google Gemini 1.5 Flash via `@convex-dev/agent` + `@ai-sdk/google`
- **Forms:** TanStack Form + Zod v4 + shadcn `<Field />`
- **State:** Jotai atoms (co-located with features)
- **Deployment:** Vercel

---

## Route Structure

```
app/
├── page.tsx                          # Landing (EventCraft AI branding)
├── (auth)/
│   ├── layout.tsx                    # AuthGuard(requireAuth=false)
│   ├── sign-in/page.tsx              # GitHub OAuth login
│   └── onboarding/
│       ├── layout.tsx                # AuthGuard(requireAuth=true, requireOnboardingComplete=false)
│       └── page.tsx                  # 3-step wizard
│
├── (protected)/
│   ├── layout.tsx                    # AuthGuard(requireAuth=true, requireOnboardingComplete=true)
│   ├── explore/page.tsx              # Discovery engine
│   ├── events/
│   │   ├── create/
│   │   │   ├── layout.tsx            # metadata
│   │   │   └── page.tsx              # Two-pipeline creation (AI or manual)
│   │   └── [id]/
│   │       ├── page.tsx              # Event detail (dynamic metadata)
│   │       └── edit/page.tsx         # Event edit (dynamic metadata)
│   ├── tickets/
│   │   ├── page.tsx                  # My Tickets dashboard
│   │   └── [ticketCode]/page.tsx     # Full-screen ticket + QR (dynamic metadata)
│   ├── dashboard/page.tsx            # Organizer analytics
│   ├── scanner/
│   │   ├── layout.tsx                # metadata
│   │   └── [eventId]/page.tsx       # QR check-in scanner
│   ├── admin/page.tsx                # Admin panel
│   └── profile/page.tsx              # User profile management
```

---

## Metadata

| Route | Title | Description |
| --- | --- | --- |
| `/` | EventCraft AI — Events at the speed of thought | AI-powered event creation. Describe your event in plain language. AI builds the draft. |
| `/sign-in` | Sign In — EventCraft AI | Sign in to create and discover events. |
| `/onboarding` | Get Started — EventCraft AI | Set up your preferences to discover events tailored to you. |
| `/explore` | Explore Events — EventCraft AI | Discover events happening around you. |
| `/events/create` | Create Event — EventCraft AI | Create a new event. Use AI to generate the draft or start from scratch. |
| `/events/[id]` | `{event.title} — EventCraft AI` | Dynamic from event description |
| `/events/[id]/edit` | Edit `{event.title} — EventCraft AI` | Edit event details |
| `/dashboard` | Dashboard — EventCraft AI | Your events. Your metrics. All in one place. |
| `/tickets` | My Tickets — EventCraft AI | Your event tickets. QR-coded. Always in your pocket. |
| `/tickets/[ticketCode]` | `{event.title} Ticket — EventCraft AI` | Dynamic from event |
| `/scanner/[eventId]` | Check-In Scanner — EventCraft AI | Scan attendee tickets for quick check-in. |
| `/profile` | Profile — EventCraft AI | Manage your account settings and preferences. |
| `/admin` | Admin — EventCraft AI | Manage users, roles, and administrative tasks. |

---

## Auth Gating (Server-Side Guards — No Middleware)

`AuthGuard` in route group layouts handles auth and onboarding gating:

1. `requireAuth=true` + no session → redirect `/sign-in`
2. `requireOnboardingComplete=true` + `onboardingComplete: false` → redirect `/onboarding`
3. On error → fail open (let user through)

---

## Convex Schema

### `profile`

```
_id, _creationTime
userId               # BetterAuth user ID
name
avatarUrl
plan                 # "free" | "pro"  (default: "free")
interests            # string[] — category slugs
location: { city, country, countryCode, lat, lng }
timezone             # "Asia/Dhaka"
onboardingComplete   # boolean
```

### `events`

```
_id, _creationTime
organizerId          # profile._id
title
description
category             # category slug
tags                 # string[]
coverPhoto: { url, dominantColor, photographerName, photographerUrl }
status               # "draft" | "published" | "completed" | "cancelled"
venue: { name, address, city, country, lat, lng }
startDatetime        # unix ms
endDatetime          # unix ms
capacity             # number | null
registrationCount    # denormalized
isFeatured           # boolean
theme: { accentColor, layoutVariant }
coOrganizers         # profileId[]
searchableText       # lowercase concat
```

### `registrations`

```
_id, _creationTime
profileId            # profile._id
eventId              # events._id
ticketCode           # nanoid(12)
status               # "active" | "cancelled"
checkedIn            # boolean
checkedInAt          # number | null
cancelledAt          # number | null
```

### `eventAnalytics`

```
_id
eventId              # events._id
dailyCounts: { [dateString]: number }
totalRegistrations   # number
totalCheckedIn       # number
```

### `categories`

```
_id
name
slug                 # unique
iconName
colorToken
```

### `onboarding`

```
_id
profileId            # profile._id
completedSteps       # number[]
stepOneData          # { interests: string[] }
stepTwoData          # { city, country, countryCode, lat, lng, timezone }
```

---

## Convex Functions

### `api.profiles`

- `getCurrent` — query, profile for authenticated user
- `create` — mutation, creates profile on first login
- `completeOnboarding` — mutation, sets interests/location

### `api.events`

- `getMyEvents` — query, organized + co-organized
- `getById` — query, single event
- `create` — mutation, enforces plan limit
- `update` — mutation, partial update
- `publish` — mutation, publishes draft
- `cancel` — mutation, cancels event
- `getActiveEventCount` — query
- `getPlanUsage` — query
- `generateFromPrompt` — action, Gemini generates event
- `modifyEventData` — action, Gemini modifies event

### `api.registrations`

- `register` — mutation, atomic with capacity check
- `cancelRegistration` — mutation, 1hr cutoff
- `getMyRegistrations` — query
- `getByTicketCode` — query
- `getEventRegistrations` — query (organizer only)

### `api.discovery`

- `getPersonalizedEvents` — matching interests
- `getEventsByLocation` — by city/country
- `getEventsByCategory` — by slug
- `getTrendingEvents` — most registered 7 days
- `getEventDetail` — event + organizer + isOrganizer + isRegistered
- `searchEvents` — full-text search

### `api.checkin`

- `checkIn` — mutation
- `manualCheckIn` — mutation
- `getEventAnalytics` — query

### `api.categories`

- `list` — query
- `getBySlug` — query

### `api.onboarding`

- `get` — query
- `saveStepOne` — mutation
- `saveStepTwo` — mutation

---

## Features

### 1. Landing Page (`/`)

- Bold hero: "Events, at the speed of thought."
- Two CTAs: "Get Started" + "View Demo"
- Animated gradient orbs background
- Live mock preview card showing features
- Minimal footer with tagline

### 2. Authentication

- GitHub OAuth via BetterAuth
- Profile created on first login
- `onboardingComplete: false` → redirect `/onboarding`

### 3. Onboarding (3 steps)

1. **Interests** — "Pick categories you're interested in."
2. **Location** — "Where are you located?"
3. **Welcome** — "You're all set!"

### 4. Event Creation

Two pipelines:

- **AI:** Prompt → Review → Cover → Venue/Schedule
- **Manual:** Details → Cover → Venue/Schedule

AI uses Gemini via `@convex-dev/agent`.

### 5. Discovery (`/explore`)

- Personalized carousel (interests)
- Location-based carousel
- Category tabs
- Global search (300ms debounce)

### 6. Event Detail

- Server-rendered with metadata
- Registration CTA states: Register, View Ticket, Manage Event, Event Full, Event Ended

### 7. Tickets

- QR code via `qrcode` library
- Full-screen view with Wake Lock API
- Cancel up to 1hr before event

### 8. Dashboard

- KPIs: Total Registered, Checked In, Engagement Rate, Capacity Remaining
- Event list with status badges

### 9. Scanner

- Camera-based QR decoding (`@zxing/browser`)
- Manual entry fallback
- Auto-reset toggle (3s / 1.5s)

### 10. Profile

- Edit name, avatar
- Session management
- Passkey management

---

## Implementation Status

### Completed

- [x] Convex schema
- [x] All Convex functions
- [x] BetterAuth + admin plugin
- [x] AuthGuard
- [x] Onboarding wizard
- [x] Two-pipeline event creation
- [x] AI generation via Gemini
- [x] Event detail page
- [x] Event edit page
- [x] My Tickets
- [x] Ticket QR code
- [x] Dashboard KPIs
- [x] QR Scanner
- [x] Admin panel
- [x] Plan limits
- [x] Landing page
- [x] SEO metadata
- [x] Route-level context.md

### Planned

- [ ] Unsplash cover photos
- [ ] Paid tickets
- [ ] Real-time analytics charts
- [ ] Offline scanner queue
- [ ] Co-organizer management
- [ ] WCAG 2.1 AA audit
