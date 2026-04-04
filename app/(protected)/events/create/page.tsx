"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import { EventWizardAiPromptStep } from "@/features/events/components/EventWizardAiPromptStep"
import { EventWizardAiReviewStep } from "@/features/events/components/EventWizardAiReviewStep"
import { EventWizardCoverPhotoStep } from "@/features/events/components/EventWizardCoverPhotoStep"
import { EventWizardLanding } from "@/features/events/components/EventWizardLanding"
import { EventWizardManualDetailsStep } from "@/features/events/components/EventWizardManualDetailsStep"
import { EventWizardNavigation } from "@/features/events/components/EventWizardNavigation"
import { EventWizardStepIndicator } from "@/features/events/components/EventWizardStepIndicator"
import { EventWizardVenueScheduleStep } from "@/features/events/components/EventWizardVenueScheduleStep"
import {
  AI_STEP_DESCRIPTIONS,
  AI_WIZARD_STEPS,
  MANUAL_STEP_DESCRIPTIONS,
  MANUAL_WIZARD_STEPS,
} from "@/features/events/constants"
import {
  aiWizardStepAtom,
  manualWizardStepAtom,
  resetWizard,
  selectedPipelineAtom,
  setAiWizardStep,
  setIsSavingDraft,
  setManualWizardStep,
  setWizardEventId,
  wizardDataAtom,
  type AiWizardStep,
  type ManualWizardStep,
} from "@/features/events/eventWizard"
import { useMutation } from "convex/react"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function getStepDescription(pipeline: "ai" | "manual", step: AiWizardStep | ManualWizardStep): string {
  if (pipeline === "ai") {
    return AI_STEP_DESCRIPTIONS[step as AiWizardStep] ?? ""
  }
  return MANUAL_STEP_DESCRIPTIONS[step as ManualWizardStep] ?? ""
}

function getStepLabel(
  pipeline: "ai" | "manual",
  step: AiWizardStep | ManualWizardStep,
  steps: { key: string; label: string }[]
): string {
  return steps.find(s => s.key === step)?.label ?? ""
}

export default function CreateEventPage() {
  const [selectedPipeline] = useAtom(selectedPipelineAtom)
  const [aiStep] = useAtom(aiWizardStepAtom)
  const [manualStep] = useAtom(manualWizardStepAtom)
  const [wizardFormData] = useAtom(wizardDataAtom)
  const [, dispatchSetWizardEventId] = useAtom(setWizardEventId)
  const [, dispatchSetIsSavingDraft] = useAtom(setIsSavingDraft)
  const [, dispatchSetAiStep] = useAtom(setAiWizardStep)
  const [, dispatchSetManualStep] = useAtom(setManualWizardStep)
  const [, dispatchResetWizard] = useAtom(resetWizard)

  const createEventMutation = useMutation(api.events.create)
  const publishEventMutation = useMutation(api.events.publish)

  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

  const aiSteps = AI_WIZARD_STEPS
  const manualSteps = MANUAL_WIZARD_STEPS
  const currentStep = selectedPipeline === "ai" ? aiStep : manualStep
  const steps = selectedPipeline === "ai" ? aiSteps : manualSteps
  const currentStepIndex = steps.findIndex(step => step.key === currentStep)

  async function handleSaveDraft() {
    dispatchSetIsSavingDraft(true)
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

      dispatchSetWizardEventId(createResult.data)
      toast.success("Draft saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save draft")
    } finally {
      dispatchSetIsSavingDraft(false)
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
    if (nextStepIndex < steps.length) {
      if (selectedPipeline === "ai") {
        dispatchSetAiStep(steps[nextStepIndex].key as AiWizardStep)
      } else {
        dispatchSetManualStep(steps[nextStepIndex].key as ManualWizardStep)
      }
    }
  }

  function handleNavigateBack() {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      if (selectedPipeline === "ai") {
        dispatchSetAiStep(steps[prevStepIndex].key as AiWizardStep)
      } else {
        dispatchSetManualStep(steps[prevStepIndex].key as ManualWizardStep)
      }
    }
  }

  function handleBackToLanding() {
    dispatchResetWizard()
  }

  function renderStepContent(step: AiWizardStep | ManualWizardStep) {
    if (selectedPipeline === "ai") {
      switch (step) {
        case "ai-prompt":
          return <EventWizardAiPromptStep />
        case "ai-review":
          return <EventWizardAiReviewStep />
        case "cover-photo":
          return <EventWizardCoverPhotoStep />
        case "venue-schedule":
          return <EventWizardVenueScheduleStep />
        default:
          return null
      }
    }

    switch (step) {
      case "details":
        return <EventWizardManualDetailsStep />
      case "cover-photo":
        return <EventWizardCoverPhotoStep />
      case "venue-schedule":
        return <EventWizardVenueScheduleStep />
      default:
        return null
    }
  }

  if (!selectedPipeline) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
            <p className="mt-1 text-muted-foreground">Choose how you want to create your event.</p>
          </div>

          <EventWizardLanding />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
          <p className="mt-1 text-muted-foreground">Build your event step by step.</p>
        </div>

        <EventWizardStepIndicator currentStep={currentStep} steps={steps} />

        <Card>
          <CardHeader>
            <CardTitle>{getStepLabel(selectedPipeline, currentStep, steps)}</CardTitle>
            <CardDescription>{getStepDescription(selectedPipeline, currentStep)}</CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent(currentStep)}</CardContent>
        </Card>

        <EventWizardNavigation
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
          isSubmitting={isPublishing}
          isSaving={false}
          onBack={handleNavigateBack}
          onNext={handleNavigateNext}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublishEvent}
          onBackToLanding={handleBackToLanding}
        />
      </div>
    </div>
  )
}
