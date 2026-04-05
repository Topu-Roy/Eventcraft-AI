# Final Architecture & Implementation Plan

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
├── (auth)/
│   ├── layout.tsx                    # AuthGuard(requireAuth=false)
│   └── sign-in/page.tsx              # GitHub OAuth login
│
├── (protected)/
│   ├── layout.tsx                    # AuthGuard(requireAuth=true, requireOnboardingComplete=true)
│   ├── onboarding/
│   │   ├── layout.tsx                # AuthGuard(requireAuth=true, requireOnboardingComplete=false)
│   │   └── page.tsx                  # 3-step wizard
│   ├── explore/page.tsx              # Discovery engine
│   ├── events/
│   │   ├── create/page.tsx           # Two-pipeline creation (AI or manual)
│   │   └── [id]/
│   │       ├── page.tsx              # Event detail (server-rendered)
│   │       └── edit/page.tsx         # Event edit (TanStack Form)
│   ├── tickets/
│   │   ├── page.tsx                  # My Tickets dashboard
│   │   └── [ticketCode]/page.tsx     # Full-screen ticket + QR
│   ├── dashboard/page.tsx            # Organizer analytics
│   ├── scanner/[eventId]/page.tsx    # QR check-in scanner
│   ├── admin/page.tsx                # Admin panel (BetterAuth admin role)
│   └── profile/page.tsx              # User profile management
│
└── page.tsx                          # Landing (redirects based on auth)
```

---

## Auth Gating (Server-Side Guards — No Middleware)

Instead of middleware, auth and onboarding gating is handled by a server component `AuthGuard` used in route group layouts.

**`AuthGuard` behavior (runs server-side before render):**

1. If `requireAuth=true` and no valid BetterAuth session → redirect to `/sign-in`.
2. If `requireOnboardingComplete=true` and user's `onboardingComplete` is false → redirect to `/onboarding`.
3. On any error (session query fails, Convex timeout), **fail open** — let the user through rather than creating a redirect loop. Log the failure.

**Layout hierarchy:**

- `app/(auth)/layout.tsx` → `AuthGuard(requireAuth=false, requireOnboardingComplete=false)` — public auth pages
- `app/(protected)/layout.tsx` → `AuthGuard(requireAuth=true, requireOnboardingComplete=true)` — all protected routes
- `app/(protected)/onboarding/layout.tsx` → `AuthGuard(requireAuth=true, requireOnboardingComplete=false)` — allows incomplete onboarding

---

## Convex Schema

### `profile`

User profile table, separate from BetterAuth's internal user table. Linked via `userId` (which equals `identity.subject` from BetterAuth).

```
_id, _creationTime
userId               # BetterAuth user ID (identity.subject)
name
avatarUrl
plan                 # "free" | "pro"  (default: "free", from lib/plan.config.ts)
interests            # string[]  — array of category slugs, mutable
location: {
  city               # "Dhaka"
  country            # "Bangladesh"
  countryCode        # "BD"
  lat                # number
  lng                # number
}
timezone             # "Asia/Dhaka" — from Intl API at onboarding
onboardingComplete   # boolean
```

### `events`

```
_id, _creationTime
organizerId          # reference to profile._id
title
description
category             # category slug
tags                 # string[]
coverPhoto: {
  url                # placeholder URL (Unsplash coming later)
  dominantColor      # hex string — fallback for broken images
  photographerName
  photographerUrl
}
status               # "draft" | "published" | "completed" | "cancelled"
venue: {
  name
  address
  city
  country
  lat
  lng
}
startDatetime        # number (unix ms)
endDatetime          # number (unix ms)
capacity             # number | null  (null = unlimited)
registrationCount    # number — denormalized cache
isFeatured           # boolean
theme: {
  accentColor        # hex — Pro only
  layoutVariant      # "default" | "minimal" | "bold" — Pro only
}
coOrganizers         # profileId[]
searchableText       # lowercase concatenation of title + description + tags
```

### `registrations`

```
_id, _creationTime
profileId            # reference to profile._id
eventId              # reference to events._id
ticketCode           # nanoid(12) — unique index enforced
status               # "active" | "cancelled"
checkedIn            # boolean
checkedInAt          # number | null
cancelledAt          # number | null
```

### `eventAnalytics`

```
_id
eventId              # reference to events._id
dailyCounts: {
  [dateString]: number   # "2025-01-15": 42 — pre-aggregated per day
}
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
profileId            # reference to profile._id
completedSteps       # number[]  — [1, 2] means steps 1 and 2 done
stepOneData          # { interests: string[] }
stepTwoData          # { city, country, countryCode, lat, lng, timezone }
```

### Indexes

```
events: by_category_status_date    (category, status, startDatetime)
events: by_location_status         (venue.city, venue.country, status)
events: by_organizer               (organizerId)
events: search index on            (searchableText) with filter on status
registrations: by_profileId_status (profileId, status)
registrations: by_eventId_status   (eventId, status)
registrations: by_profileId_event  (profileId, eventId)
registrations: by_ticket_code      (ticketCode)
eventAnalytics: by_event           (eventId)
categories: by_slug                (slug)
onboarding: by_profileId           (profileId)
```

---

## Convex Functions

### `convex/profiles.ts`

- `getCurrent` — query, returns profile for authenticated user
- `create` — mutation, creates profile on first login (idempotent)
- `completeOnboarding` — mutation, sets interests/location/onboardingComplete

### `convex/events.ts`

- `getMyEvents` — query, events organized + co-organized
- `getById` — query, single event with organizer access check
- `create` — mutation, creates draft event, enforces plan limit
- `update` — mutation, partial update, validates organizer access
- `publish` — mutation, publishes draft
- `cancel` — mutation, cancels event
- `getActiveEventCount` — query, count of draft+published events
- `getPlanUsage` — query, plan info + usage stats
- `generateFromPrompt` — action, Gemini generates structured event data
- `modifyEventData` — action, Gemini modifies existing data with instruction

### `convex/registrations.ts`

- `register` — mutation, atomic registration with capacity check
- `cancelRegistration` — mutation, cancels registration (1hr cutoff)
- `getMyRegistrations` — query, all registrations with event data
- `getByTicketCode` — query, single registration by code
- `getEventRegistrations` — query, all registrations for event (organizer only)

### `convex/discovery.ts`

- `getPersonalizedEvents` — events matching profile interests
- `getEventsByLocation` — events in city/country
- `getEventsByCategory` — events by category slug
- `getTrendingEvents` — most registered in past 7 days
- `getEventDetail` — event + organizer + isOrganizer + isRegistered
- `searchEvents` — full-text search via Convex search index

### `convex/checkin.ts`

- `checkIn` — mutation, checks in attendee by ticket code
- `manualCheckIn` — mutation, same as checkIn for manual entry
- `getEventAnalytics` — query, event analytics (organizer only)

### `convex/categories.ts`

- `list` — query, all categories sorted by name
- `getBySlug` — query, single category by slug

### `convex/onboarding.ts`

- `get` — query, onboarding document for profile
- `saveStepOne` — mutation, saves interests
- `saveStepTwo` — mutation, saves location

### `convex/seed.ts`

- `seedCategories` — mutation, seeds default categories (admin only)
- `isAdmin` — query, checks if user has admin role via BetterAuth

### `convex/auth.ts`

- `getUserInfo` — BetterAuth query, returns user with role (admin plugin)

### `convex/agents/`

- `eventGeneratorAgent` — Gemini agent for initial event generation
- `eventModifierAgent` — Gemini agent for modifying existing event data

---

## Feature Specifications

---

### 1. Authentication (BetterAuth + Convex)

BetterAuth handles credential validation and session token issuance. Its Convex adapter writes user records into its own internal tables. A separate `profile` table in our schema stores app-specific data, linked via `userId` (equals `identity.subject`).

**Flow:**

- User signs up via GitHub OAuth → BetterAuth creates session → profile created on first login via `api.profiles.create` → middleware detects `onboardingComplete: false` → redirect to `/onboarding`
- Every Convex mutation re-validates identity via `ctx.auth.getUserIdentity()`. Client-passed user IDs are never trusted.
- Plan status is always read from the database inside mutations. Never accepted from client request body.
- Admin role managed via BetterAuth admin plugin, checked via `auth.getUserInfo`.

---

### 2. Onboarding Flow

A 3-step wizard. Server-side `AuthGuard` blocks all protected routes until complete. Each step saves to Convex immediately on "Next" — partial progress is preserved.

**Step 1 — Interests**

- Visual grid of category cards (icon, name, color accent)
- Multi-select with checkmark overlay on selection
- Minimum 1 selection required to proceed
- Saves `stepOneData.interests` to `onboarding` document immediately

**Step 2 — Location**

- Primary option: "Use My Location" button
  - Calls `navigator.geolocation.getCurrentPosition()` with 5-second timeout and `enableHighAccuracy: false`
  - On timeout or denial: auto-focuses manual input with message "No problem — just type your city"
- Manual option: debounced city search input with country shown alongside every result
- Captures `city`, `country`, `countryCode`, `lat`, `lng` and `timezone` (from `Intl.DateTimeFormat().resolvedOptions().timeZone`)
- Saves `stepTwoData` to `onboarding` document immediately

**Step 3 — Welcome screen**

- Sets `onboardingComplete: true` on the `profile` document
- Redirects to `/explore`

**Resume logic:** when wizard mounts, it loads the existing `onboarding` document and initializes from the first incomplete step with previous answers pre-filled. Step indicators show completed steps with checkmarks.

---

### 3. AI-Powered Event Creation

Two completely separate pipelines on the same route. User chooses at landing: "Create with AI" or "Create Manually".

**AI Pipeline** (4 steps):

1. `ai-prompt` — Write prompt (20-400 chars), generate via Gemini
2. `ai-review` — Editable preview + inline modification ("Tell AI what to change")
3. `cover-photo` — Select cover from placeholders
4. `venue-schedule` — Venue, dates, capacity

**Manual Pipeline** (3 steps):

1. `details` — Title, description, category, tags
2. `cover-photo` — Select cover from placeholders
3. `venue-schedule` — Venue, dates, capacity

**Server action flow (AI generation):**

1. Call `api.events.generateFromPrompt` action
2. Action creates thread via `eventGeneratorAgent.createThread(ctx)`
3. Agent calls `thread.generateObject()` with Zod schema
4. Returns structured `{ title, description, category, tags }`
5. Validates category is real slug, returns error if not

**Modification flow (AI review step):**

1. User writes modification instruction in text input
2. Calls `api.events.modifyEventData` action
3. Agent receives previous data + instruction, returns completely new data
4. All fields replaced — not partial updates

**After generation:**

- AI output pre-populates the wizard state (shared `wizardDataAtom`)
- Every field is fully editable — AI output is a starting point, never locked
- "Generated by AI — feel free to edit" label sets correct UX expectation

**Navigation:**

- Back button on first step → AlertDialog confirmation ("Going back will lose your progress")
- "Change Mode" button (absolute positioned) → resets all state, returns to landing

---

### 4. Cover Photo Selection

Placeholder images only (Unsplash integration planned for later).

**UI:**

- Grid of 6 placeholder photos with distinct colors
- Selected photo shows checkmark overlay
- Cover photo editing disabled on edit page (coming soon note)

**What gets stored on the event document:**

- `url` — placeholder path
- `dominantColor` — hex for fallback rendering
- `photographerName` and `photographerUrl` — placeholder values

---

### 5. Free vs. Pro Plan Gate

**What counts toward the free limit:** `"draft"` and `"published"` events. `"cancelled"` and `"completed"` events do not count.

**Plan config:** `lib/plan.config.ts` — single source of truth

```ts
export const PLANS = {
  free: { maxEvents: 1 },
  pro: { maxEvents: null }, // null = unlimited
}
export const DEFAULT_PLAN: PlanId = "free"
```

**Enforcement — mutation level:**

- `api.events.create` reads profile plan and counts active events atomically
- If `!canCreateEvent(profile.plan, qualifyingCount)` → returns error
- Cannot be bypassed by calling mutation directly from browser console

**UI:**

- Dashboard shows plan usage: "X of Y events used"
- Plan limit error shown as toast on failed creation

---

### 6. Discovery Engine (Explore Page)

Built with React Server Components and Suspense boundaries.

**Carousels:**

- **Personalized carousel** — events matching profile's saved interest categories
- **Location-based carousel** — events in profile's saved city/country
- **Category browsing** — horizontally scrollable tab strip, filters all carousels

**Global search:**

- Uses Convex's native full-text search index on `searchableText`
- Client component with 300ms debounce
- Results appear in floating panel below input

---

### 7. Event Detail Page

Fully server-rendered for SEO. Generates proper Open Graph meta tags.

**Access control:**

- `status !== "published"` + user is not the organizer → `notFound()`
- Organizer viewing their own event → sees organizer UI
- Past events → "Ended" badge, registration CTA replaced
- Cancelled events → desaturated cover, "Cancelled" badge

**Registration CTA states (all detected server-side):**

- Default: "Register" button
- Already registered: "View My Ticket" button
- Event full: "Event Full" — disabled
- Past event: "Event Ended" — disabled
- Own event: "Manage Event" link to edit page

**Layout:**

- Desktop: 2-column grid (content + sticky sidebar)
- Mobile: single column + fixed bottom CTA bar

---

### 8. Registration & QR Ticket System

**Registration mutation — atomic operations:**

1. Checks `(profileId, eventId)` index — rejects if already registered
2. Checks organizer attempting to register for own event — rejects
3. Reads `registrationCount` vs `capacity` — rejects if full
4. Generates `ticketCode` via `nanoid(12)`
5. Checks `ticketCode` unique index — retries up to 3 times on collision
6. Writes registration document
7. Increments `registrationCount` on event
8. Increments `totalRegistrations` and today's `dailyCounts` in `eventAnalytics`

**Ticket display:**

- Card per ticket: event cover photo, title, date, venue, QR preview
- Full-screen ticket detail: large QR (SVG via `qrcode`), high contrast
- Screen Wake Lock API to prevent screen dimming

**Cancellation flow:**

- "Cancel Registration" visible up to 1 hour before event start
- Mutation: sets `status = "cancelled"`, sets `cancelledAt`, decrements counts
- Soft delete — document retained for audit

---

### 9. Organizer Dashboard & Analytics

All metrics from Convex reactive queries.

**KPI cards:**

- Total Registered — from `eventAnalytics.totalRegistrations`
- Checked In — from `eventAnalytics.totalCheckedIn`
- Engagement Rate — `(totalCheckedIn / totalRegistrations) * 100`
- Capacity Remaining — `capacity === null ? "Unlimited" : capacity - registrationCount`

**Event list:**

- All events organized + co-organized
- Status badges (draft, published, completed, cancelled)
- Each card links to edit page

---

### 10. QR Check-In Scanner

Client component using `@zxing/browser` for camera-based QR decoding.

**Camera states:**

- Granted → live video feed with scan overlay
- Denied → "Camera access denied" with "Try Again" button
- Dismissed → "No camera found" message

**Decode deduplication:**

- Ref tracks last decoded code + timestamp
- Same code within `autoResetMs` (default 3s) → ignored

**Three outcomes:**

- **Success** (green) → "Checked in: {name}"
- **Already checked in** (yellow) → "Already checked in"
- **Invalid** (red) → reason (not found, wrong event, cancelled, unauthorized)

**Manual entry fallback:**

- Text input for typing/pasting ticket code
- Same mutation path as QR scanning

**Auto-reset timing:**

- Standard (3s) / Fast (1.5s) toggle
- Stored in `localStorage`

---

### 11. Event Edit Page

Uses TanStack Form + Zod v4 + shadcn `<Field />` for full validation.

**Form schema:** `features/events/schemas.ts`

- Validates: title (3-200 chars), description (10-5000 chars), category (required), venue (all fields required), dates (required), capacity (optional, min 1)

**Features:**

- `onChange` validation with inline `FieldError` per field
- Dynamic tag management (add/remove)
- Cover photo display only (editing disabled)
- Submit via header button (`form="edit-event-form"`)
- Publish (draft only) and Cancel Event (published only) actions

---

## Implementation Status

### Completed

- [x] Convex schema with all tables (profile, events, registrations, eventAnalytics, categories, onboarding)
- [x] All Convex queries, mutations, and actions
- [x] BetterAuth integration with admin plugin
- [x] Server-side AuthGuard (no middleware)
- [x] Onboarding wizard (3 steps with resume logic)
- [x] Two-pipeline event creation (AI + manual)
- [x] AI event generation via `@convex-dev/agent` + Gemini
- [x] AI modification with inline instruction
- [x] Event detail page with access control
- [x] Event edit page with TanStack Form + Zod v4
- [x] My Tickets dashboard
- [x] Ticket detail with QR code
- [x] Organizer dashboard with KPIs
- [x] QR Scanner with camera + manual fallback
- [x] Admin panel with user management
- [x] Plan limits via `lib/plan.config.ts`
- [x] Shared EventCard component
- [x] Route-level context.md files for AI agents
- [x] Result object pattern (no thrown errors in Convex)
- [x] `tryCatch` utility for client-side error handling

### Planned (Not Yet Built)

- [ ] Unsplash cover photo integration
- [ ] Paid tickets / Stripe integration
- [ ] Real-time analytics with Recharts
- [ ] Offline scanner queue
- [ ] Co-organizer management UI
- [ ] Nightly counter reconciliation scheduled function
- [ ] OG meta tag generation
- [ ] WCAG 2.1 AA audit
- [ ] Lighthouse performance optimization
