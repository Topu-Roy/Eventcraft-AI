# Onboarding Route Context

## Route: `/onboarding`

### Purpose

3-step wizard that collects user interests and location before granting access to the app. Gated by `AuthGuard` in the parent layout — requires auth, does NOT require onboarding complete.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/onboarding/layout.tsx → AuthGuard(requireAuth=true, requireOnboardingComplete=false)
              └── app/(protected)/onboarding/page.tsx
```

### Key Components

| Component          | File                                                  | Type   |
| ------------------ | ----------------------------------------------------- | ------ |
| `OnboardingWizard` | `features/onboarding/components/OnboardingWizard.tsx` | Client |
| `StepIndicator`    | `features/onboarding/components/StepIndicator.tsx`    | Client |
| `StepOneInterests` | `features/onboarding/components/StepOneInterests.tsx` | Client |
| `StepTwoLocation`  | `features/onboarding/components/StepTwoLocation.tsx`  | Client |
| `StepThreeWelcome` | `features/onboarding/components/StepThreeWelcome.tsx` | Client |

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
- `api.profiles.completeOnboarding` — mutation, writes interests/location/timezone to profile, sets `onboardingComplete: true`

### Step Flow

**Step 1 — Interests**

- Fetches categories from Convex
- Grid of selectable cards (icon + name)
- Multi-select with checkmark overlay
- Min 1 selection required to enable Continue
- Saves to `onboarding` document immediately on Next via `saveStepOne`

**Step 2 — Location**

- Primary: "Use My Location" button using `navigator.geolocation` (5s timeout)
- Manual: debounced city search (300ms) using Nominatim OpenStreetMap API
- Captures city, country, countryCode, lat, lng, timezone
- Saves to `onboarding` document immediately on Next via `saveStepTwo`

**Step 3 — Welcome**

- Summary of selected interests and location
- "Explore Events" button triggers `completeOnboarding` mutation
- On success → redirects to `/explore`

### Resume Logic

When `OnboardingWizard` mounts, loads existing `onboarding` document, pre-fills completed steps, sets current step to first incomplete step.

### External APIs

- **Nominatim OpenStreetMap** — geocoding (reverse geocode + city search), free, no API key

### Edge Cases

- Geolocation denied → auto-shows manual input
- Network error on save → toast error, user stays on current step
- Double-submit on step 3 → blocked by `isSubmittingAtom`
