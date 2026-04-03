# Explore Route Context

## Route: `/explore`

### Purpose

Discovery engine — the main landing page after onboarding. Shows personalized, location-based, and trending event carousels with category filtering and global search.

### Layout Chain

```
app/layout.tsx                              → Root (providers, Header)
  └── app/(marketing)/layout.tsx            → AuthGuard(requireAuth=false, requireOnboardingComplete=false)
        └── app/(marketing)/explore/layout.tsx → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
              └── app/(marketing)/explore/page.tsx
```

### Key Components

| Component     | File                                        | Type   |
| ------------- | ------------------------------------------- | ------ |
| ExplorePage   | `app/(marketing)/explore/page.tsx`          | Server |
| SearchInput   | `app/(marketing)/explore/SearchInput.tsx`   | Client |
| EventCarousel | `app/(marketing)/explore/EventCarousel.tsx` | Client |
| CategoryTabs  | `app/(marketing)/explore/CategoryTabs.tsx`  | Client |

### Convex Functions Used

- `api.discovery.getPersonalizedEvents` — events matching user's interests, sorted by startDatetime
- `api.discovery.getTrendingEvents` — most-registered events in past 7 days (unauthenticated fallback)
- `api.discovery.getEventsByLocation` — events in user's saved city/country
- `api.discovery.getEventsByCategory` — events filtered by category slug
- `api.categories.list` — all categories for tabs
- `api.discovery.searchEvents` — global full-text search on title/description/tags

### Personalization Logic

- **Authenticated with interests** → Personalized carousel (matching categories)
- **Unauthenticated or no interests** → Trending carousel (most registrations past 7 days)
- **Location-based** → Events in user's saved city/country (from onboarding)
- **Category tabs** → Horizontal scrollable tabs, selecting adds `?category=` to URL

### Empty State Rules

- Fewer than 3 events → render as 2-column grid instead of carousel
- 0 events for personalized category → suppress carousel, show "Discover something new" with popular category events
- Never show empty carousel headers

### Search

- 300ms debounce on input
- Results in floating dropdown panel
- "See all results" navigates to `/search?q=` (future)
- All queries sanitized server-side

### URL Parameters

- `?category=<slug>` — filters all carousels by category
- `?city=<city>` — overrides user's saved location for location carousel
- Both parameters reflected in URL for shareability
- Invalid params fall back gracefully (never crash)

### Scroll Position

- Category and location links use `scroll={false}` for URL-only updates
- Scroll position saved to sessionStorage, restored on back navigation

### Edge Cases

- No categories in DB → empty tabs (seed script should be run)
- User has no interests → trending carousel shown instead
- Location not set → global feed shown
- Search returns 0 results → "No events found" empty state
- Network error → error boundary with retry button

### Next Steps

After clicking an event card → navigates to `/events/[id]` (event detail page).
