# Onboarding Route Context

## Route: `/onboarding`

### Purpose

3-step wizard that collects user interests and location before granting access to the app. Gated by `AuthGuard` in the parent layout — requires auth, does NOT require onboarding complete.

### Layout Chain

```
app/layout.tsx                          → Root (providers)
  └── app/(onboarding)/layout.tsx       → AuthGuard(requireAuth=true, requireOnboardingComplete=false)
        └── app/(onboarding)/onboarding/page.tsx
```

### Key Components

| Component          | File                                                  | Type   |
| ------------------ | ----------------------------------------------------- | ------ |
| `OnboardingWizard` | `features/onboarding/components/OnboardingWizard.tsx` | Client |
| `StepIndicator`    | `features/onboarding/components/StepIndicator.tsx`    | Client |
| `StepOneInterests` | `features/onboarding/components/StepOneInterests.tsx` | Client |
| `StepTwoLocation`  | `features/onboarding/components/StepTwoLocation.tsx`  | Client |
| `StepThreeWelcome` | `features/onboarding/components/StepThreeWelcome.tsx` | Client |
| `AuthGuard`        | `components/auth/AuthGuard.tsx`                       | Server |

### State Management (Jotai Atoms)

- `currentStepAtom` — tracks active step (1, 2, or 3)
- `stepOneDataAtom` — `{ interests: string[] }`
- `stepTwoDataAtom` — `{ city, country, countryCode, lat, lng, timezone }`
- `isSubmittingAtom` — blocks double-submission on step 3

### Convex Functions Used

- `api.categories.list` — query, no auth, returns all categories sorted by name
- `api.onboarding.get` — query, requires auth, returns onboarding doc or null
- `api.onboarding.saveStepOne` — mutation, saves interests + marks step 1 complete
- `api.onboarding.saveStepTwo` — mutation, saves location + marks step 2 complete
- `api.users.completeOnboarding` — mutation, writes interests/location/timezone to user doc, sets `onboardingComplete: true`

### Auth Guard Behavior

- No session → redirect to `/sign-in`
- Session exists but no user record → redirect to `/onboarding` (this page)
- Session exists, user exists, `onboardingComplete === false` → allow (this is the onboarding page)
- Session exists, user exists, `onboardingComplete === true` → redirect to `/explore` (handled by other layouts)
- Any error → fail open, let user through, log error

### Step Flow

**Step 1 — Interests**

- Fetches categories from Convex
- Grid of selectable cards (icon + name)
- Multi-select with checkmark overlay
- Min 1 selection required to enable Continue
- Saves to `onboarding` document immediately on Next via `saveStepOne`

**Step 2 — Location**

- Primary: "Use My Location" button using `navigator.geolocation`
  - 5-second timeout
  - `enableHighAccuracy: false`
  - On timeout/denial → shows manual input with message "No problem — just type your city"
- Manual: debounced city search (300ms) using Nominatim OpenStreetMap API
  - Results show city + country to prevent ambiguity
- Captures city, country, countryCode, lat, lng, timezone (from `Intl.DateTimeFormat`)
- Saves to `onboarding` document immediately on Next via `saveStepTwo`

**Step 3 — Welcome**

- Summary of selected interests and location
- "Explore Events" button triggers `completeOnboarding` mutation
- On success → redirects to `/explore`
- On error → toast error, resets submitting state

### Resume Logic

When `OnboardingWizard` mounts:

1. Loads existing `onboarding` document via `useOnboarding()` hook
2. If step 1 is complete, pre-fills `stepOneDataAtom` from `onboarding.stepOneData`
3. If step 2 is complete, pre-fills `stepTwoDataAtom` from `onboarding.stepTwoData`
4. Sets `currentStep` to first incomplete step (1 → 2 → 3)
5. Step indicator shows completed steps with checkmarks

### External APIs

- **Nominatim OpenStreetMap** — used for geocoding (reverse geocode + city search)
  - Free, no API key required
  - Rate limited — 1 request per second
  - Debounced at 300ms for search input

### Edge Cases

- Geolocation denied → auto-shows manual input
- Geolocation timeout → auto-shows manual input
- No categories in DB → empty grid (seed script should be run first)
- Network error on save → toast error, user stays on current step
- Double-submit on step 3 → blocked by `isSubmittingAtom`

### Next Steps

After onboarding complete, user lands on `/explore` — discovery engine (Phase 3).
