# Onboarding Route Context

## Route: `/onboarding`

### Metadata

- **Title:** Get Started — EventCraft AI
- **Description:** Set up your preferences to discover events tailored to you.

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/onboarding/layout.tsx → AuthGuard(requireAuth=true, requireOnboardingComplete=false)
              └── app/(auth)/onboarding/page.tsx
```

### Key Components

| Component          | File                                                  | Type   |
| ------------------ | ----------------------------------------------------- | ------ |
| `OnboardingWizard` | `features/onboarding/components/OnboardingWizard.tsx` | Client |
| `StepIndicator`    | `features/onboarding/components/StepIndicator.tsx`    | Client |
| `StepOneInterests` | `features/onboarding/components/StepOneInterests.tsx` | Client |
| `StepTwoLocation`  | `features/onboarding/components/StepTwoLocation.tsx`  | Client |
| `StepThreeWelcome` | `features/onboarding/components/StepThreeWelcome.tsx` | Client |

### State (Jotai)

- `currentStepAtom` — step 1, 2, or 3
- `stepOneDataAtom` — `{ interests: string[] }`
- `stepTwoDataAtom` — `{ city, country, countryCode, lat, lng, timezone }`
- `isSubmittingAtom` — blocks step 3 double-submit

### Steps

**Step 1 — Interests**

- "What are you interested in?"
- Grid of category cards, multi-select
- Saves to `onboarding` doc on Next

**Step 2 — Location**

- "Where are you located?"
- Use My Location or manual search
- Saves to `onboarding` doc on Next

**Step 3 — Welcome**

- "You're all set!"
- "Explore Events" → `completeOnboarding` → redirect `/explore`

### Resume Logic

Loads existing `onboarding` doc, pre-fills completed steps.

### External APIs

- **Nominatim OpenStreetMap** — geocoding, free, no API key

### Edge Cases

- Geolocation denied → auto-show manual input
- Network error → toast error, stay on step
- Double-submit → blocked by `isSubmittingAtom`
