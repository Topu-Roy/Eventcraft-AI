# Event Creation Route Context

## Route: `/events/create`

### Purpose

Two-pipeline event creation wizard: AI-assisted or manual. Pipelines are completely separate with independent state.

### Layout Chain

```
app/layout.tsx                          → Root (providers, Header)
  └── app/(protected)/layout.tsx        → AuthGuard(requireAuth=true, requireOnboardingComplete=true)
        └── app/(protected)/events/create/page.tsx
```

### Pipelines

**Landing View** (no pipeline selected)

- Two cards: "Create with AI" or "Create Manually"
- Clicking one locks the pipeline, clears all state

**AI Pipeline** (4 steps)

1. `ai-prompt` — Write prompt, generate via Gemini
2. `ai-review` — Editable preview + inline modification ("Tell AI what to change")
3. `cover-photo` — Select cover from placeholders
4. `venue-schedule` — Venue, dates, capacity

**Manual Pipeline** (3 steps)

1. `details` — Title, description, category, tags
2. `cover-photo` — Select cover from placeholders
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

### State Management (Jotai Atoms)

**Pipeline selection**

- `selectedPipelineAtom` — `"ai" | "manual" | null`

**AI Pipeline**

- `aiWizardStepAtom` — current step
- `aiPromptTextAtom` — prompt textarea value
- `aiGeneratedDataAtom` — generated event data
- `aiModificationTextAtom` — modification instruction text
- `aiIsModifyingAtom` — modification in progress

**Manual Pipeline**

- `manualWizardStepAtom` — current step

**Shared**

- `wizardDataAtom` — form data both pipelines write to
- `wizardEventIdAtom` — created event ID
- `wizardIsSavingAtom` — draft save in progress
- `isGeneratingAtom` — AI generation in progress

### Convex Functions Used

- `api.events.create` — mutation, creates event as draft, enforces plan limit
- `api.events.publish` — mutation, publishes draft event
- `api.events.cancel` — mutation, cancels published event
- `api.events.generateFromPrompt` — action, Gemini generates structured event data
- `api.events.modifyEventData` — action, Gemini modifies existing data with instruction
- `api.categories.list` — query, all categories for select

### AI Agents

- `eventGeneratorAgent` — `convex/agents/eventGenerator.ts` — initial generation from prompt
- `eventModifierAgent` — `convex/agents/eventModifier.ts` — modification with instruction

### Plan Limits

- Free: 1 active event (draft + published)
- Pro: unlimited
- Enforced in `api.events.create` mutation
- Config in `lib/plan.config.ts`

### Navigation

- Back button on first step → AlertDialog confirmation ("Going back will lose your progress")
- Within pipeline → normal back navigation
- "Change Mode" button → resets all state, returns to landing

### Edge Cases

- AI picks invalid category → error toast, retry
- Plan limit reached → error on create
- Network error during generation → toast, prompt stays intact
