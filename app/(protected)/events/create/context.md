# Event Creation Route Context

## Route: `/events/create`

### Metadata

- **Title:** Create Event — EventCraft AI
- **Description:** Create a new event. Use AI to generate the draft or start from scratch.

### Layout Chain

```
app/layout.tsx
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true)
        └── app/(protected)/events/create/layout.tsx
              └── app/(protected)/events/create/page.tsx
```

### Pipelines

**Landing**

- "Create with AI" or "Start from scratch"

**AI Pipeline** (4 steps)

1. `ai-prompt` — Describe event, generate via Gemini
2. `ai-review` — Editable preview + modification
3. `cover-photo` — Select cover
4. `venue-schedule` — Venue, dates, capacity

**Manual Pipeline** (3 steps)

1. `details` — Title, description, category, tags
2. `cover-photo` — Select cover
3. `venue-schedule` — Venue, dates, capacity

### Key Components

| Component                      | File                                                          | Type   |
| ------------------------------ | ------------------------------------------------------------- | ------ |
| `EventWizardLanding`           | `features/events/components/EventWizardLanding.tsx`           | Client |
| `EventWizardAiPromptStep`      | `features/events/components/EventWizardAiPromptStep.tsx`      | Client |
| `EventWizardAiReviewStep`      | `features/events/components/EventWizardAiReviewStep.tsx`      | Client |
| `EventWizardManualDetailsStep` | `features/events/components/EventWizardManualDetailsStep.tsx` | Client |
| `EventWizardCoverPhotoStep`    | `features/events/components/EventWizardCoverPhotoStep.tsx`    | Client |
| `EventWizardVenueScheduleStep` | `features/events/components/EventWizardVenueScheduleStep.tsx` | Client |
| `EventWizardNavigation`        | `features/events/components/EventWizardNavigation.tsx`        | Client |
| `EventWizardStepIndicator`     | `features/events/components/EventWizardStepIndicator.tsx`     | Client |

### State (Jotai)

- `selectedPipelineAtom` — `"ai" | "manual" | null`
- `aiWizardStepAtom` — current AI step
- `manualWizardStepAtom` — current manual step
- `wizardDataAtom` — form data shared between pipelines

### Plan Limits

- Free: 1 active event
- Pro: unlimited
- Enforced in `api.events.create`

### Edge Cases

- AI invalid category → error toast
- Plan limit reached → error on create
- Network error → toast, prompt stays
