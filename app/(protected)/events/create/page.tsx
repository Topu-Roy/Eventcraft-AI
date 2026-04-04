"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import { EventWizardAiPromptStep } from "@/features/events/components/EventWizardAiPromptStep"
import { EventWizardCoverPhotoStep } from "@/features/events/components/EventWizardCoverPhotoStep"
import { EventWizardDetailsStep } from "@/features/events/components/EventWizardDetailsStep"
import { EventWizardNavigation } from "@/features/events/components/EventWizardNavigation"
import { EventWizardStepIndicator } from "@/features/events/components/EventWizardStepIndicator"
import { EventWizardVenueScheduleStep } from "@/features/events/components/EventWizardVenueScheduleStep"
import { WIZARD_STEP_DESCRIPTIONS, WIZARD_STEPS } from "@/features/events/constants"
import {
  resetWizard,
  setWizardStep,
  wizardDataAtom,
  wizardEventIdAtom,
  wizardIsSavingAtom,
  wizardStepAtom,
  type WizardStep,
} from "@/features/events/eventWizard"
import { useMutation } from "convex/react"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function EventWizardStepContent({ currentStep }: { currentStep: WizardStep }) {
  switch (currentStep) {
    case "ai-prompt":
      return <EventWizardAiPromptStep />
    case "details":
      return <EventWizardDetailsStep />
    case "cover-photo":
      return <EventWizardCoverPhotoStep />
    case "venue-schedule":
      return <EventWizardVenueScheduleStep />
    default:
      return null
  }
}

function EventWizardStepDescription({ stepIndex }: { stepIndex: number }) {
  return WIZARD_STEP_DESCRIPTIONS[stepIndex] ?? ""
}

export default function CreateEventPage() {
  const [currentWizardStep] = useAtom(wizardStepAtom)
  const [wizardFormData] = useAtom(wizardDataAtom)
  const [, setWizardEventId] = useAtom(wizardEventIdAtom)
  const [, setIsSavingDraft] = useAtom(wizardIsSavingAtom)
  const [, dispatchSetWizardStep] = useAtom(setWizardStep)
  const [, dispatchResetWizard] = useAtom(resetWizard)

  const createEventMutation = useMutation(api.events.create)
  const publishEventMutation = useMutation(api.events.publish)

  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

  const currentStepIndex = WIZARD_STEPS.findIndex(step => step.key === currentWizardStep)

  async function handleSaveDraft() {
    setIsSavingDraft(true)
    try {
      if (!wizardFormData.title || !wizardFormData.category) {
        toast.error("Title and category are required to save")
        return
      }

      const startTimestamp = wizardFormData.startDatetime
        ? new Date(wizardFormData.startDatetime).getTime()
        : Date.now()
      const endTimestamp = wizardFormData.endDatetime
        ? new Date(wizardFormData.endDatetime).getTime()
        : startTimestamp + 3600000

      const venuePayload = wizardFormData.venue
        ? {
            name: wizardFormData.venue.name ?? "TBD",
            address: wizardFormData.venue.address ?? "TBD",
            city: wizardFormData.venue.city ?? "TBD",
            country: wizardFormData.venue.country ?? "TBD",
            lat: wizardFormData.venue.lat ?? 0,
            lng: wizardFormData.venue.lng ?? 0,
          }
        : { name: "TBD", address: "TBD", city: "TBD", country: "TBD", lat: 0, lng: 0 }

      const coverPhotoPayload = wizardFormData.coverPhoto ?? {
        url: "/placeholders/tech.svg",
        dominantColor: "#3B82F6",
        photographerName: "Placeholder",
        photographerUrl: "#",
      }

      const createResult = await createEventMutation({
        title: wizardFormData.title,
        description: wizardFormData.description ?? "TBD",
        category: wizardFormData.category,
        tags: wizardFormData.tags,
        venue: venuePayload,
        startDatetime: startTimestamp,
        endDatetime: endTimestamp,
        capacity: wizardFormData.capacity,
        coverPhoto: coverPhotoPayload,
      })

      if (createResult.error) {
        toast.error(createResult.cause)
        return
      }

      setWizardEventId(createResult.data)
      toast.success("Draft saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save draft")
    } finally {
      setIsSavingDraft(false)
    }
  }

  async function handlePublishEvent() {
    if (
      !wizardFormData.title ||
      !wizardFormData.description ||
      !wizardFormData.category ||
      !wizardFormData.venue ||
      !wizardFormData.startDatetime ||
      !wizardFormData.endDatetime
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsPublishing(true)
    try {
      const startTimestamp = new Date(wizardFormData.startDatetime).getTime()
      const endTimestamp = new Date(wizardFormData.endDatetime).getTime()

      const venuePayload = {
        name: wizardFormData.venue.name,
        address: wizardFormData.venue.address,
        city: wizardFormData.venue.city,
        country: wizardFormData.venue.country,
        lat: wizardFormData.venue.lat ?? 0,
        lng: wizardFormData.venue.lng ?? 0,
      }

      const coverPhotoPayload = wizardFormData.coverPhoto ?? {
        url: "/placeholders/tech.svg",
        dominantColor: "#3B82F6",
        photographerName: "Placeholder",
        photographerUrl: "#",
      }

      const createResult = await createEventMutation({
        title: wizardFormData.title,
        description: wizardFormData.description,
        category: wizardFormData.category,
        tags: wizardFormData.tags,
        venue: venuePayload,
        startDatetime: startTimestamp,
        endDatetime: endTimestamp,
        capacity: wizardFormData.capacity,
        coverPhoto: coverPhotoPayload,
      })

      if (createResult.error) {
        toast.error(createResult.cause)
        setIsPublishing(false)
        return
      }

      const createdEventId = createResult.data
      if (!createdEventId) {
        toast.error("Failed to create event")
        setIsPublishing(false)
        return
      }

      await publishEventMutation({ eventId: createdEventId })
      dispatchResetWizard()
      toast.success("Event published!")
      router.push(`/events/${createdEventId}/edit`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish event")
    } finally {
      setIsPublishing(false)
    }
  }

  function handleNavigateNext() {
    const nextStepIndex = currentStepIndex + 1
    if (nextStepIndex < WIZARD_STEPS.length) {
      dispatchSetWizardStep(WIZARD_STEPS[nextStepIndex].key)
    }
  }

  function handleNavigateBack() {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      dispatchSetWizardStep(WIZARD_STEPS[prevStepIndex].key)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
          <p className="mt-1 text-muted-foreground">Build your event step by step.</p>
        </div>

        <EventWizardStepIndicator currentStep={currentWizardStep} />

        <Card>
          <CardHeader>
            <CardTitle>{WIZARD_STEPS[currentStepIndex]?.label}</CardTitle>
            <CardDescription>
              <EventWizardStepDescription stepIndex={currentStepIndex} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventWizardStepContent currentStep={currentWizardStep} />
          </CardContent>
        </Card>

        <EventWizardNavigation
          currentStepIndex={currentStepIndex}
          totalSteps={WIZARD_STEPS.length}
          isSubmitting={isPublishing}
          isSaving={false}
          onBack={handleNavigateBack}
          onNext={handleNavigateNext}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublishEvent}
        />
      </div>
    </div>
  )
}
