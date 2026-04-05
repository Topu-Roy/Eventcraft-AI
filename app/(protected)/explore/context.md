# Explore Route Context

## Route: `/explore`

### Purpose

Discovery engine — the main landing page after onboarding. Shows personalized, location-based, and trending event carousels with category filtering and global search.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/explore/page.tsx
```

### Key Components

| Component               | File                                              | Type   |
| ----------------------- | ------------------------------------------------- | ------ |
| `EventCarousel`         | `features/discovery/components/EventCarousel.tsx` | Client |
| `EventCarouselSkeleton` | `features/discovery/components/EventCarousel.tsx` | Client |
| `CategoryTabs`          | `features/discovery/components/CategoryTabs.tsx`  | Client |
| `SearchInput`           | `features/discovery/components/SearchInput.tsx`   | Client |

### Convex Functions Used

- `api.discovery.getPersonalizedEvents` — events matching profile's interests, sorted by startDatetime
- `api.discovery.getTrendingEvents` — most-registered events in past 7 days
- `api.discovery.getEventsByLocation` — events in profile's saved city/country
- `api.discovery.getEventsByCategory` — events filtered by category slug
- `api.discovery.searchEvents` — full-text search on title/description/tags
- `api.categories.list` — all categories for tabs
- `api.profiles.getCurrent` — profile data for location-based results

### Personalization Logic

- **Authenticated with interests** → Personalized carousel (matching categories)
- **Unauthenticated or no interests** → Trending carousel (most registrations past 7 days)
- **Location-based** → Events in profile's saved city/country
- **Category tabs** → Horizontal scrollable tabs, selecting adds `?category=` to URL

### Search

- 300ms debounce on input
- Results in floating dropdown panel
- All queries sanitized server-side

### URL Parameters

- `?category=<slug>` — filters all carousels by category
- `?city=<city>` — overrides profile's saved location for location carousel

### Edge Cases

- No categories in DB → empty tabs (seed script should be run first)
- Profile has no interests → trending carousel shown instead
- Location not set → global feed shown
- Search returns 0 results → "No events found" empty state
