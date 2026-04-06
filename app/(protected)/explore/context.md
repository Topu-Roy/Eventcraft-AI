# Explore Route Context

## Route: `/explore`

### Metadata

- **Title:** Explore Events — EventCraft AI
- **Description:** Discover events happening around you.

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/explore/page.tsx
```

### Key Components

| Component       | File                                              | Type   |
| --------------- | ------------------------------------------------- | ------ |
| `EventCarousel` | `features/discovery/components/EventCarousel.tsx` | Client |
| `CategoryTabs`  | `features/discovery/components/CategoryTabs.tsx`  | Client |
| `SearchInput`   | `features/discovery/components/SearchInput.tsx`   | Client |

### Convex Functions

- `api.discovery.getPersonalizedEvents` — matching interests
- `api.discovery.getTrendingEvents` — most registered past 7 days
- `api.discovery.getEventsByLocation` — by city/country
- `api.discovery.getEventsByCategory` — by slug
- `api.discovery.searchEvents` — full-text search
- `api.categories.list` — all categories
- `api.profiles.getCurrent` — profile for location

### Personalization

- Authenticated + interests → Personalized carousel
- No interests → Trending carousel
- Location-based → Events in saved city/country

### URL Parameters

- `?category=<slug>` — filter by category
- `?city=<city>` — override location

### Search

- 300ms debounce
- Results in floating dropdown
