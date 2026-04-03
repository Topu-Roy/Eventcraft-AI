# Event Creation Wizard - Context

## Route

`/organizer/events/create`

## Purpose

Multi-step wizard for organizers to create events with AI assistance (placeholder), event details, cover photo selection, and venue/schedule setup.

## Features

- 4-step wizard: AI Prompt → Event Details → Cover Photo → Venue & Schedule
- Jotai atoms for wizard state management (step, data, eventId, saving state)
- Save as draft on any step
- Publish event on final step
- Step indicator with progress bar
- Tag management (add/remove)
- Cover photo picker with placeholders

## State Management

- `wizardStepAtom`: Current wizard step
- `wizardDataAtom`: All form data
- `wizardEventIdAtom`: Created event ID
- `wizardIsSavingAtom`: Save in progress flag
- `updateWizardData`: Dispatch partial updates
- `setWizardStep`: Navigate between steps
- `resetWizard`: Clear all wizard state

## Convex Mutations Used

- `api.events.create`: Create event as draft
- `api.events.publish`: Publish draft event

## Convex Queries Used

- `api.categories.list`: Populate category dropdown

## Dependencies

- Jotai for state
- Convex for data
- Sonner for toast notifications
- Lucide React for icons
- shadcn/ui components
