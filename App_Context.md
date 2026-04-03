# Final Architecture & Implementation Plan

---

## Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Convex (database, server functions, real-time, file storage)
- **Auth:** BetterAuth with Convex adapter
- **AI:** Google Gemini 1.5 Flash
- **Photos:** Unsplash API
- **Deployment:** Vercel

---

## Route Structure

```
app/
├── (marketing)/
│   ├── page.tsx                  # Landing page (public, SSR)
│   └── explore/page.tsx          # Discovery engine (public, partial pre-rendering)
│
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── onboarding/page.tsx       # Multi-step wizard, middleware gated
│
├── (attendee)/
│   ├── events/[id]/page.tsx      # Event detail page
│   ├── tickets/page.tsx          # My Tickets dashboard
│   └── tickets/[ticketCode]/page.tsx  # Single ticket + QR display
│
├── (organizer)/
│   ├── dashboard/page.tsx        # Analytics dashboard
│   ├── events/create/page.tsx    # Creation wizard
│   ├── events/[id]/edit/page.tsx
│   └── scanner/[eventId]/page.tsx # QR check-in scanner
│
└── check-in/[ticketCode]/page.tsx # Scanner redirect target (public)
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
- `app/(onboarding)/layout.tsx` → `AuthGuard(requireAuth=true, requireOnboardingComplete=false)` — gated but allows incomplete onboarding
- `app/(marketing)/layout.tsx` → `AuthGuard(requireAuth=false, requireOnboardingComplete=false)` — public marketing pages
- `app/(marketing)/explore/layout.tsx` → `AuthGuard(requireAuth=true, requireOnboardingComplete=true)` — requires full onboarding
- `app/(attendee)/layout.tsx` → `AuthGuard(requireAuth=true, requireOnboardingComplete=true)` — requires full onboarding
- `app/(organizer)/layout.tsx` → `AuthGuard(requireAuth=true, requireOnboardingComplete=true)` — requires full onboarding

---

## Convex Schema

### `users`

```
_id, _creationTime
authId               # BetterAuth user ID
email
name
avatarUrl
role                 # "attendee" | "organizer" | "both"
plan                 # "free" | "pro"  (default: "free")
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
organizerId          # reference to users._id
title
description
category             # category slug
tags                 # string[]
coverPhoto: {
  url                # Unsplash regular URL
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
registrationCount    # number — denormalized cache, reconciled nightly
isFeatured           # boolean
theme: {
  accentColor        # hex — Pro only
  layoutVariant      # "default" | "minimal" | "bold" — Pro only
}
coOrganizers         # userId[]
```

### `registrations`

```
_id, _creationTime
userId               # reference to users._id
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
userId               # reference to users._id
completedSteps       # number[]  — [1, 2] means steps 1 and 2 done
stepOneData          # { interests: string[] }
stepTwoData          # { city, country, lat, lng, timezone }
```

### Indexes

```
events: by_category_status_date    (category, status, startDatetime)
events: by_location_status         (venue.city, venue.country, status)
events: by_organizer               (organizerId)
events: search index on            (title, description, tags)
registrations: by_user             (userId, status)
registrations: by_event            (eventId, status)
registrations: unique on           (userId, eventId)     # prevents duplicates
registrations: unique on           (ticketCode)          # prevents collision
```

---

## Feature Specifications

---

### 1. Authentication (BetterAuth + Convex)

BetterAuth handles credential validation and session token issuance. Its Convex adapter writes user records directly into your Convex `users` table — no separate auth database.

**Flow:**

- User signs up → BetterAuth creates session → adapter writes `users` document → middleware detects `onboardingComplete: false` → redirect to `/onboarding`
- Every Convex mutation re-validates identity via `ctx.auth.getUserIdentity()`. Client-passed user IDs are never trusted.
- Plan status is always read from the database inside mutations. It is never accepted from the client request body.

---

### 2. Onboarding Flow

A 3-step wizard. Middleware blocks all protected routes until complete. Each step saves to Convex immediately on "Next" — partial progress is preserved across devices and sessions.

**Step 1 — Interests**

- Visual grid of category cards (icon, name, color accent)
- Multi-select with checkmark overlay on selection
- Minimum 1 selection required to proceed
- Saves `stepOneData.interests` to `onboarding` document immediately

**Step 2 — Location**

- Primary option: "Use My Location" button
  - Calls `navigator.geolocation.getCurrentPosition()` with 5-second timeout and `enableHighAccuracy: false`
  - Shows spinner with "Getting your location..." immediately on tap
  - On timeout or denial: auto-focuses manual input with message "No problem — just type your city"
  - Never leaves button in a hung loading state
- Manual option: debounced city search input with country shown alongside every result (prevents "Springfield" ambiguity)
- Captures `city`, `country`, `countryCode`, `lat`, `lng` and `timezone` (from `Intl.DateTimeFormat().resolvedOptions().timeZone`)
- Saves `stepTwoData` to `onboarding` document immediately

**Step 3 — Welcome screen**

- Sets `onboardingComplete: true` on the `users` document
- Redirects to `/explore`

**Resume logic:** when wizard mounts, it loads the existing `onboarding` document and initializes from the first incomplete step with previous answers pre-filled. Step indicators show completed steps with checkmarks.

---

### 3. AI-Powered Event Creation

The creation wizard's first step. Organizer writes a single prompt describing their event.

**Prompt input rules:**

- 400-character hard limit with visible character counter
- Disabled until at least 20 characters entered

**Server action flow:**

1. Fetch category list from Convex. This result is cached with Next.js `unstable_cache` for 10 minutes — no DB round-trip per request.
2. Build system prompt: instruct Gemini to return only a JSON object with `title`, `description`, `category` (must match one of the injected slugs), `tags`. Categories are injected as a JSON array — never string-interpolated inline.
3. Call Gemini 1.5 Flash with streaming enabled.
4. Stream the response through to the client using a streaming server action — the user sees the description typing out in real time.
5. On stream completion, strip markdown code fences, trim whitespace, then parse JSON.
6. Validate against Zod schema. Also validate semantically: title ≥ 10 chars, description ≥ 100 chars, category is a real slug.
7. If validation fails, retry once with a stricter prompt. On second failure, return a user-facing error.

**Double submission prevention:**

- Button enters loading state on first click, disabled until response completes or errors.
- A ref tracks in-flight request ID. Responses from stale requests are silently dropped.

**Stream cancellation:**

- An `AbortController` is created per request and passed into the fetch.
- On component unmount (user navigates away), `abort()` is called, terminating the stream cleanly.

**After generation:**

- AI output pre-populates the subsequent wizard steps.
- Every field is fully editable — AI output is a starting point, never locked.
- A visible "Generated by AI — feel free to edit" label sets the correct UX expectation.

---

### 4. Unsplash Cover Photo Selection

A dedicated wizard step after category and title are confirmed.

**Auto-search logic:**

- Extract the 2–3 most visually descriptive words from the title — strip years, stop words, generic words ("annual", "meeting", "2025").
- Combine with category name to build the Unsplash query.
- Cache results by query string using `unstable_cache` with a 24-hour TTL. Same query from multiple organizers hits the cache, not the API.

**UI:**

- 6-photo grid rendered as a selectable tile group.
- Manual search input on the step for organizers who want different results.
- Selected photo shows a checkmark overlay.

**What gets stored on the event document:**

- `url` — Unsplash `regular` size URL with `&w=1200&q=80` appended for display, `&w=400&q=75` for thumbnails. Sizing is applied at render time, not stored separately.
- `dominantColor` — Unsplash returns this as a hex in the API response. Stored for fallback rendering.
- `photographerName` and `photographerUrl` — required by Unsplash ToS.

**Attribution:** a single `<EventCoverImage>` component wraps Next.js `<Image>` and always renders a "Photo by [Name] on Unsplash" credit. Every surface — event cards, detail page, tickets, OG images — uses this component. Attribution cannot be accidentally omitted.

**Fallback for broken images:** if the Unsplash URL returns a non-200 response, the component renders a gradient using `dominantColor` as the base. Looks intentional, never broken.

**Cover photo is required to publish.** The wizard's Publish button stays disabled until the photo step is complete. Per-category built-in fallback photos (pre-selected static assets) are auto-applied if Unsplash is unavailable — every published event always has a cover photo.

---

### 5. Free vs. Pro Plan Gate

**What counts toward the free limit:** `"draft"` and `"published"` events. `"cancelled"` and soft-deleted events do not count. This rule is documented visibly in the UI — free users see "1 of 1 events used" in their dashboard.

**Enforcement — two layers, both required:**

Layer 1 — UI gate: when a free user with ≥1 qualifying event clicks "Create Event," a server component detects this before render and shows an upgrade prompt page instead of the wizard. No flash, no client-side redirect.

Layer 2 — Convex mutation: the creation mutation reads the user's event count and plan atomically in a single transaction. If count ≥ 1 and plan is `"free"`, the mutation throws. This cannot be bypassed by calling the mutation directly from the browser console.

**Race condition prevention:** the mutation uses Convex's optimistic concurrency — it reads count and writes the new event atomically. If two concurrent requests conflict, one retries, sees count=1, and throws. No double-creation possible.

**Downgrade state (for when payments are added):** events belonging to a downgraded user that put them over the limit get status `"over_limit"`. They remain visible and functional for existing attendees. The organizer cannot edit them or create new ones until they re-upgrade or reduce their count below the limit.

**Theme customization (Pro only):** the theme fields on the event document exist in the schema from day one but are only editable through UI gated by a plan check. Non-Pro users see the fields with a lock icon linking to the upgrade page. The Convex mutation that saves event settings validates plan server-side before writing theme fields.

---

### 6. Discovery Engine (Explore Page)

Built with partial pre-rendering. The structural shell (nav, category tabs, search bar) is pre-rendered. Each carousel section is an independent Suspense boundary that streams in its own data.

**Carousels:**

- **Personalized carousel** — events matching the user's saved interest categories, sorted by `startDatetime` ascending. Unauthenticated visitors see a "Trending" carousel instead (most-registered events in the past 7 days).
- **Location-based carousel** — events in the user's saved city/country. Location can be overridden via the location switcher, which writes a `?city=` URL parameter and triggers a new server render of this section.
- **Category browsing** — a horizontally scrollable tab strip. Selecting a category adds `?category=` to the URL and filters all carousels below it. Both parameters are reflected in the URL for shareability and indexability.

**Empty state rules:**

- Fewer than 3 events: render as a 2-column grid instead of a carousel.
- 0 events for a personalized category: suppress the carousel entirely. Replace with a "Discover something new" section showing events from the most popular category the user didn't select. Never show an empty carousel header.

**Location switcher:**

- Dropdown showing user's saved city and 3–4 popular cities.
- Invalid `?city=` params fall back to the user's profile location, then to a global feed. Validated server-side — never crashes on "narnia."
- City names always display with country ("Dhaka, Bangladesh") to prevent ambiguity.

**Global search:**

- Uses Convex's native full-text search index on `title`, `description`, `tags`.
- Client component with 300ms debounce.
- Results appear in a floating panel below the input. "See all results" navigates to `/search?q=` with full pagination.
- All queries run through `encodeURIComponent()`. Leading/trailing whitespace stripped server-side before querying.

**Pagination:**

- Uses Convex's built-in `paginationOptsValidator` with a stable cursor based on creation time + document ID.
- New events published mid-session appear at the top of fresh queries, not injected into existing paginated results — no duplicate or skipped result issues.

**Scroll position:**

- Category and location filter links use `scroll={false}` — URL updates without full page navigation.
- Scroll position saved to `sessionStorage` on scroll (throttled). Restored after mount if navigating back.

---

### 7. Event Detail Page

Fully server-rendered for SEO. Generates proper Open Graph meta tags (title, description, cover photo URL) for rich social sharing previews.

**Access control:**

- `status !== "published"` + user is not the organizer → Next.js `notFound()`. No redirect, a real 404. Prevents URL guessing and draft content leaks.
- Organizer viewing their own event → renders organizer UI (edit controls, dashboard link, attendee count) instead of attendee UI (registration button). Detected server-side, no flash.
- Past events (`endDatetime` has passed) → registration CTA replaced with "This event has ended." Event stays fully visible. Does not appear in discovery carousels (filtered by `startDatetime >= now`) but does appear in search with a "Past Event" badge.
- Cancelled events → a dedicated state: desaturated cover photo overlay, "This event has been cancelled" heading, original details for context, and a "Browse similar events" section pulling from the same category.

**Registration CTA states (all detected server-side before render):**

- Default: "Register" button
- Already registered: "View My Ticket" button
- Event full (`capacity !== null && registrationCount >= capacity`): "Event Full" — no button
- Past event: "This event has ended" — no button
- Own event: "Manage Event" link to organizer dashboard

**Capacity storage:** `null` means unlimited. A number means limited. `capacity = 0` is never used — it's semantically ambiguous. The check is always `capacity !== null && registrationCount >= capacity`.

**Layout:**

- Desktop: sticky registration card in the right column, follows scroll.
- Mobile: fixed bottom bar with `padding-bottom` equal to bar height on the page content — no content obscured. Uses `env(safe-area-inset-bottom)` for iOS notched devices.

---

### 8. Registration & QR Ticket System

**Registration mutation — what it does atomically in one transaction:**

1. Checks `(userId, eventId)` unique index — rejects if already registered (prevents duplicates even on double-click).
2. Checks organizer attempting to register for their own event — rejects.
3. Reads `registrationCount` and checks against `capacity` — rejects if full.
4. Generates `ticketCode` via `nanoid(12)`.
5. Checks `ticketCode` unique index — if collision, regenerates and retries up to 3 times.
6. Writes registration document.
7. Atomically increments `registrationCount` on the event document.
8. Atomically increments `totalRegistrations` and today's `dailyCounts` bucket in `eventAnalytics`.

**Client-side protection:** Register button enters loading state on first click, disabled until mutation resolves.

**Ticket display (My Tickets dashboard):**

- Card per ticket: event cover photo, title, date, venue, small QR preview.
- Full-screen ticket detail page designed for phone screen display at venues: large QR, high contrast, large event name and date.
- QR rendered client-side by `qrcode.react` as an SVG. Encodes the URL `https://app.com/check-in/[ticketCode]`.
- Screen Wake Lock API requested on the ticket detail page to prevent screen dimming in queue. If unsupported (iOS <16.4, some Android WebViews), a visible notice "Keep your screen on while scanning" is displayed instead.

**Cancellation flow:**

- "Cancel Registration" button visible on ticket detail page up to 1 hour before event start time. After that, button disappears — no cancellations in the final hour.
- Mutation: sets `registration.status = "cancelled"`, sets `cancelledAt`, decrements `registrationCount`, and invalidates `ticketCode` so it can never be scanned successfully.
- Soft delete — the document is retained for audit purposes, never hard-deleted.

**QR screenshot transfer:** first-scan invalidation (the `checkedIn` flag) is the only protection in the MVP. This is acceptable for free registration. True rotating QR codes (regenerating every 30 seconds) are a future phase feature, introduced alongside paid tickets.

---

### 9. Organizer Dashboard & Real-Time Analytics

All metrics are Convex reactive query subscriptions. Convex pushes diffs to the client when data changes — no polling, no manual WebSocket management.

**Four KPI cards (each a separate reactive query for granular re-rendering):**

- Total Registered — reads `totalRegistrations` from `eventAnalytics`
- Checked In — reads `totalCheckedIn` from `eventAnalytics`
- Engagement Rate — `(totalCheckedIn / totalRegistrations) * 100`, computed in the query
- Capacity Remaining — `capacity === null ? "Unlimited" : capacity - registrationCount`

**Registration timeline chart:**

- Reads `dailyCounts` from `eventAnalytics` (pre-aggregated, O(30) read — not O(n) over all registrations)
- Rendered with Recharts as an area chart
- X-axis always in the organizer's timezone (stored in `users.timezone`). Chart subtitle shows timezone name ("Times shown in Asia/Dhaka")
- Updates in real time as new registrations write to `dailyCounts`

**Earnings card:** not shown. The space shows a "Ticket Sales — coming with paid events" placeholder linking to the upgrade page. A permanently $0 metric looks like a bug.

**Counter drift reconciliation:** a Convex scheduled function runs nightly. It counts actual `active` registration documents per event and reconciles the `registrationCount` on the event document and `totalRegistrations` in `eventAnalytics` if they've drifted. Drift is rare but this ensures long-term accuracy.

**Co-organizer access:** the event document has a `coOrganizers: userId[]` array. Dashboard access check: `event.organizerId === userId || event.coOrganizers.includes(userId)`. Primary organizer can add co-organizers from event settings.

---

### 10. QR Check-In Scanner

A client component. Uses `@zxing/browser` to continuously decode frames from the device camera.

**Camera initialization:**

- Requests rear camera explicitly via `facingMode: "environment"`.
- Camera flip button cycles through available `MediaDevices` sources for fallback.
- Explicit permission state handling:
  - Granted → start stream
  - Denied → "Camera access denied" message with browser settings instructions
  - Dismissed/hung (no resolution after 500ms) → "Tap here to allow camera access" retry button
  - Never shows a blank black viewfinder with no explanation.

**Decode deduplication:**

- A ref stores the last decoded ticket code and the timestamp.
- Same code decoded again within 3 seconds: ignored entirely.
- Prevents the same code from firing 10–15 mutations per second while held in frame.

**Check-in mutation — three outcomes with distinct UI responses:**

- **Valid, first scan:** large green checkmark, attendee name displayed, success haptic (mobile). Auto-resets to scanning after 3 seconds.
- **Already checked in:** yellow warning state showing original check-in time. Not an error — the organizer makes the judgment call.
- **Invalid ticket:** red state with clear message. Covers wrong event, tampered code, non-existent code, cancelled registration.

**Optimistic response:** scanner shows outcome immediately from local pre-validation (format check, basic sanity), then confirms with the Convex mutation. If the mutation contradicts (edge case), corrects with a brief animation. This makes the scanner feel instant over slow venue WiFi.

**Offline resilience:**

- Check-ins are queued in memory when the network is unavailable.
- Scanner UI shows an "Offline — syncing when connected" badge.
- When connectivity resumes, the queue flushes to Convex automatically.
- Mutation handles late-synced check-ins: marks as checked in if not already, flags conflicts (same ticket checked in twice from different offline devices) for organizer review in the attendee list.

**Manual check-in fallback:**

- A second tab on the scanner page: a text input for typing or pasting a ticket code directly.
- Same mutation as QR path.
- Complete fallback for broken cameras and damaged QR codes.

**Auto-reset timing:**

- "Standard Mode" (default): 3-second reset
- "Fast Mode": 1.5-second reset for high-volume venues
- Toggle stored in `localStorage`, persists across venue sessions.

---

## Implementation Phases

### Phase 1 — Foundation (Week 1–2)

Initialize Next.js with App Router, Tailwind, shadcn/ui. Set up Convex and define the complete schema upfront — changing schema mid-build is costly. Configure BetterAuth with the Convex adapter. Build signup, login, logout. Build middleware with auth and onboarding gating (including fail-open error handling). Build the 3-step onboarding wizard with resume logic and geolocation handling.

**Exit criteria:** a user can sign up, complete onboarding (including location), and land on a gated home screen.

---

### Phase 2 — Event Creation (Week 3–4)

Build the multi-step creation wizard shell with draft auto-save. Build the manual creation path first (no AI yet) to validate the form structure and Convex mutations. Add the Gemini integration as Step 1, including streaming, retry logic, and abort handling. Add the Unsplash photo picker step with auto-search, manual search, and fallback photos. Wire up event publishing (draft → published). Add the Pro plan gate — both the UI redirect and the mutation-level enforcement.

**Exit criteria:** an organizer can AI-generate, customize, and publish a complete event.

---

### Phase 3 — Discovery Engine (Week 5–6)

Build the explore page with partial pre-rendering. Implement all carousel types with their Convex queries and indexes. Add the location switcher with URL parameter handling and invalid param fallbacks. Add the category browser. Add global search with the Convex search index. Build the event detail page with all access control states, the sticky/fixed registration CTA layout, and Open Graph meta tags.

**Exit criteria:** any visitor can discover, browse, and view event details.

---

### Phase 4 — Registration & Ticketing (Week 7)

Implement the registration mutation with all atomic operations, unique index enforcement, and capacity race condition handling. Build the My Tickets dashboard. Build the full-screen ticket detail page with QR rendering, Wake Lock, and the cancellation flow. Add the `check-in/[ticketCode]` redirect target page.

**Exit criteria:** an attendee can register for an event, view their QR ticket, and cancel before the cutoff.

---

### Phase 5 — Organizer Tools (Week 8)

Build the analytics dashboard with pre-aggregated reactive queries wired to Recharts. Implement all four KPI cards and the timezone-aware timeline chart. Build the QR scanner page with all camera permission states, deduplication, offline queue, manual fallback, and the three outcome states. Add the attendee list view showing registrations and check-in status. Add co-organizer access.

**Exit criteria:** the full event lifecycle is complete — from creation through check-in and live analytics.

---

### Phase 6 — Polish & Hardening (Week 9–10)

WCAG 2.1 AA audit across every page: focus management in wizards, ARIA labels on charts, keyboard navigation through carousels. Add loading skeletons for every Suspense boundary. Add error boundaries for Convex query failures. Run Lighthouse on every key page and resolve Core Web Vitals regressions. Set up the nightly Convex scheduled function for counter reconciliation. Verify all edge cases — cancelled events, past events, draft access, over-capacity, offline scanner — are handled correctly end-to-end.

**Exit criteria:** the platform is production-ready and handles real-world failure modes gracefully.

---
