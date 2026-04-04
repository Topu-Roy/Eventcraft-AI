"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import {
  resetWizard,
  setWizardStep,
  updateWizardData,
  wizardDataAtom,
  wizardEventIdAtom,
  wizardIsSavingAtom,
  wizardStepAtom,
  type WizardStep,
} from "@/features/events/eventWizard"
import { useMutation, useQuery } from "convex/react"
import { useAtom } from "jotai"
import { ArrowLeft, ArrowRight, Calendar, ImageIcon, MapPin, Rocket, Save, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const WIZARD_STEPS: { key: WizardStep; label: string; icon: typeof Sparkles }[] = [
  { key: "ai-prompt", label: "AI Prompt", icon: Sparkles },
  { key: "details", label: "Event Details", icon: Calendar },
  { key: "cover-photo", label: "Cover Photo", icon: ImageIcon },
  { key: "venue-schedule", label: "Venue & Schedule", icon: MapPin },
]

const PLACEHOLDER_PHOTOS = [
  {
    url: "/placeholders/tech.svg",
    dominantColor: "#3B82F6",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/music.svg",
    dominantColor: "#8B5CF6",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/food.svg",
    dominantColor: "#F59E0B",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/sports.svg",
    dominantColor: "#10B981",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/art.svg",
    dominantColor: "#EC4899",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/business.svg",
    dominantColor: "#6366F1",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
]

function EventWizardStepIndicator({ currentStep }: { currentStep: WizardStep }) {
  const currentStepIndex = WIZARD_STEPS.findIndex(step => step.key === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const isCurrentStep = step.key === currentStep
          const isCompletedStep = index < currentStepIndex
          const StepIcon = step.icon

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCurrentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompletedStep
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                }`}
              >
                <StepIcon className="size-4" />
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrentStep ? "text-foreground" : isCompletedStep ? "text-primary" : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      <Progress value={progressPercentage} className="h-1" />
    </div>
  )
}

function EventWizardAiPromptStep() {
  const [aiPromptText, setAiPromptText] = useState("")

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Sparkles className="mx-auto size-8 text-primary" />
        <h2 className="text-xl font-semibold">Describe your event</h2>
        <p className="text-sm text-muted-foreground">Tell us about your event and AI will help you set it up.</p>
      </div>
      <Textarea
        placeholder="e.g., A weekend tech conference in San Francisco about AI and machine learning with 200 attendees..."
        className="min-h-32"
        value={aiPromptText}
        onChange={e => setAiPromptText(e.target.value)}
      />
      <p className="text-center text-xs text-muted-foreground">
        AI-powered event creation coming soon. For now, continue to fill in details manually.
      </p>
    </div>
  )
}

function EventWizardDetailsStep() {
  const wizardData = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdateWizardData] = useAtom(updateWizardData)
  const categories = useQuery(api.categories.list)
  const [tagInputText, setTagInputText] = useState("")

  function handleAddTag() {
    const trimmedTag = tagInputText.trim()
    if (trimmedTag && !wizardData.tags.includes(trimmedTag)) {
      dispatchUpdateWizardData({ tags: [...wizardData.tags, trimmedTag] })
      setTagInputText("")
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    dispatchUpdateWizardData({ tags: wizardData.tags.filter(tag => tag !== tagToRemove) })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="event-title">Event Title</Label>
        <Input
          id="event-title"
          placeholder="e.g., TechConf 2026"
          value={wizardData.title}
          onChange={e => dispatchUpdateWizardData({ title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          placeholder="Describe your event..."
          className="min-h-24"
          value={wizardData.description}
          onChange={e => dispatchUpdateWizardData({ description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="event-category">Category</Label>
        <Select
          value={wizardData.category || undefined}
          onValueChange={selectedValue => dispatchUpdateWizardData({ category: selectedValue })}
        >
          <SelectTrigger id="event-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map(category => (
              <SelectItem key={category._id} value={category.slug}>
                {category.name}
              </SelectItem>
            )) ?? null}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInputText}
            onChange={e => setTagInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={handleAddTag}>
            Add
          </Button>
        </div>
        {wizardData.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {wizardData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function EventWizardCoverPhotoStep() {
  const wizardData = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdateWizardData] = useAtom(updateWizardData)

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Choose a cover photo</h2>
        <p className="text-sm text-muted-foreground">
          Select a cover image for your event. More options coming soon.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {PLACEHOLDER_PHOTOS.map(photo => {
          const isPhotoSelected = wizardData.coverPhoto?.url === photo.url
          return (
            <button
              key={photo.url}
              type="button"
              className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                isPhotoSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/50"
              }`}
              onClick={() => dispatchUpdateWizardData({ coverPhoto: photo })}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: photo.dominantColor }}
              >
                <ImageIcon className="size-8 text-primary-foreground/80" aria-hidden="true" />
              </div>
              {isPhotoSelected ? (
                <div className="absolute top-2 right-2">
                  <Badge variant="default">Selected</Badge>
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
      {wizardData.coverPhoto ? (
        <p className="text-center text-xs text-muted-foreground">
          Photo by {wizardData.coverPhoto.photographerName}
        </p>
      ) : null}
    </div>
  )
}

function EventWizardVenueScheduleStep() {
  const wizardData = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdateWizardData] = useAtom(updateWizardData)

  const venueDetails = wizardData.venue ?? {
    name: "",
    address: "",
    city: "",
    country: "",
    lat: 0,
    lng: 0,
  }

  function handleUpdateVenue(venueUpdates: Partial<typeof venueDetails>) {
    dispatchUpdateWizardData({ venue: { ...venueDetails, ...venueUpdates } })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="venue-name">Venue Name</Label>
        <Input
          id="venue-name"
          placeholder="e.g., Moscone Center"
          value={venueDetails.name}
          onChange={e => handleUpdateVenue({ name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="venue-address">Address</Label>
        <Input
          id="venue-address"
          placeholder="e.g., 747 Howard St"
          value={venueDetails.address}
          onChange={e => handleUpdateVenue({ address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="venue-city">City</Label>
          <Input
            id="venue-city"
            placeholder="e.g., San Francisco"
            value={venueDetails.city}
            onChange={e => handleUpdateVenue({ city: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="venue-country">Country</Label>
          <Input
            id="venue-country"
            placeholder="e.g., United States"
            value={venueDetails.country}
            onChange={e => handleUpdateVenue({ country: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-datetime">Start Date & Time</Label>
          <Input
            id="start-datetime"
            type="datetime-local"
            value={wizardData.startDatetime}
            onChange={e => dispatchUpdateWizardData({ startDatetime: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end-datetime">End Date & Time</Label>
          <Input
            id="end-datetime"
            type="datetime-local"
            value={wizardData.endDatetime}
            onChange={e => dispatchUpdateWizardData({ endDatetime: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="capacity">Capacity (optional)</Label>
        <Input
          id="capacity"
          type="number"
          min={1}
          placeholder="Leave empty for unlimited"
          value={wizardData.capacity ?? ""}
          onChange={e => dispatchUpdateWizardData({ capacity: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    </div>
  )
}

function EventWizardNavigation({
  currentStepIndex,
  totalSteps,
  isSubmitting,
  isSaving,
  onBack,
  onNext,
  onSaveDraft,
  onPublish,
}: {
  currentStepIndex: number
  totalSteps: number
  isSubmitting: boolean
  isSaving: boolean
  onBack: () => void
  onNext: () => void
  onSaveDraft: () => void
  onPublish: () => void
}) {
  const isLastStep = currentStepIndex === totalSteps - 1

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {currentStepIndex > 0 ? (
          <Button variant="outline" onClick={onBack} disabled={isSubmitting || isSaving}>
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Button>
        ) : null}
        <Button variant="outline" onClick={onSaveDraft} disabled={isSubmitting || isSaving}>
          <Save className="mr-1 size-4" />
          Save Draft
        </Button>
      </div>

      {isLastStep ? (
        <Button onClick={onPublish} disabled={isSubmitting || isSaving}>
          <Rocket className="mr-1 size-4" />
          {isSubmitting ? "Publishing..." : "Publish Event"}
        </Button>
      ) : (
        <Button onClick={onNext} disabled={isSubmitting || isSaving}>
          Next
          <ArrowRight className="ml-1 size-4" />
        </Button>
      )}
    </div>
  )
}

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
  const descriptions = [
    "Let AI help you plan your event.",
    "Fill in the basic details about your event.",
    "Pick a cover photo that represents your event.",
    "Set the venue, date, and time.",
  ]

  return descriptions[stepIndex] ?? ""
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
            name: wizardFormData.venue.name || "TBD",
            address: wizardFormData.venue.address || "TBD",
            city: wizardFormData.venue.city || "TBD",
            country: wizardFormData.venue.country || "TBD",
            lat: wizardFormData.venue.lat || 0,
            lng: wizardFormData.venue.lng || 0,
          }
        : {
            name: "TBD",
            address: "TBD",
            city: "TBD",
            country: "TBD",
            lat: 0,
            lng: 0,
          }

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
      router.push(`/organizer/events/${createdEventId}/edit`)
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
