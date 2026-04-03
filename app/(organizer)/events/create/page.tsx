"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import {
  resetWizard,
  setWizardStep,
  updateWizardData,
  wizardDataAtom,
  wizardEventIdAtom,
  wizardIsSavingAtom,
  wizardStepAtom,
  type WizardStep,
} from "@/store/eventWizard"
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

const steps: { key: WizardStep; label: string; icon: typeof Sparkles }[] = [
  { key: "ai-prompt", label: "AI Prompt", icon: Sparkles },
  { key: "details", label: "Event Details", icon: Calendar },
  { key: "cover-photo", label: "Cover Photo", icon: ImageIcon },
  { key: "venue-schedule", label: "Venue & Schedule", icon: MapPin },
]

function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  const currentIndex = steps.findIndex(s => s.key === currentStep)
  const progress = ((currentIndex + 1) / steps.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep
          const isCompleted = index < currentIndex
          const Icon = step.icon

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  )
}

function StepAiPrompt() {
  const [prompt, setPrompt] = useState("")

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
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <p className="text-center text-xs text-muted-foreground">
        AI-powered event creation coming soon. For now, continue to fill in details manually.
      </p>
    </div>
  )
}

function StepDetails({ categories }: { categories: Doc<"categories">[] }) {
  const data = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdate] = useAtom(updateWizardData)
  const [tagInput, setTagInput] = useState("")

  function addTag() {
    const trimmed = tagInput.trim()
    if (trimmed && !data.tags.includes(trimmed)) {
      dispatchUpdate({ tags: [...data.tags, trimmed] })
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    dispatchUpdate({ tags: data.tags.filter(t => t !== tag) })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="event-title">Event Title</Label>
        <Input
          id="event-title"
          placeholder="e.g., TechConf 2026"
          value={data.title}
          onChange={e => dispatchUpdate({ title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          placeholder="Describe your event..."
          className="min-h-24"
          value={data.description}
          onChange={e => dispatchUpdate({ description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="event-category">Category</Label>
        <Select value={data.category || undefined} onValueChange={value => dispatchUpdate({ category: value })}>
          <SelectTrigger id="event-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat._id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag()
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            Add
          </Button>
        </div>
        {data.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const placeholderPhotos = [
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

function StepCoverPhoto() {
  const data = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdate] = useAtom(updateWizardData)

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Choose a cover photo</h2>
        <p className="text-sm text-muted-foreground">
          Select a cover image for your event. More options coming soon.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {placeholderPhotos.map((photo, index) => {
          const isSelected = data.coverPhoto?.url === photo.url
          return (
            <button
              key={index}
              type="button"
              className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/50"
              }`}
              onClick={() => dispatchUpdate({ coverPhoto: photo })}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: photo.dominantColor }}
              >
                <ImageIcon className="size-8 text-primary-foreground/80" aria-hidden="true" />
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Badge variant="default">Selected</Badge>
                </div>
              )}
            </button>
          )
        })}
      </div>
      {data.coverPhoto && (
        <p className="text-center text-xs text-muted-foreground">Photo by {data.coverPhoto.photographerName}</p>
      )}
    </div>
  )
}

function StepVenueSchedule() {
  const data = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdate] = useAtom(updateWizardData)

  const venue = data.venue ?? { name: "", address: "", city: "", country: "", lat: 0, lng: 0 }

  function updateVenue(updates: Partial<typeof venue>) {
    dispatchUpdate({ venue: { ...venue, ...updates } })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="venue-name">Venue Name</Label>
        <Input
          id="venue-name"
          placeholder="e.g., Moscone Center"
          value={venue.name}
          onChange={e => updateVenue({ name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="venue-address">Address</Label>
        <Input
          id="venue-address"
          placeholder="e.g., 747 Howard St"
          value={venue.address}
          onChange={e => updateVenue({ address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="venue-city">City</Label>
          <Input
            id="venue-city"
            placeholder="e.g., San Francisco"
            value={venue.city}
            onChange={e => updateVenue({ city: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="venue-country">Country</Label>
          <Input
            id="venue-country"
            placeholder="e.g., United States"
            value={venue.country}
            onChange={e => updateVenue({ country: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-datetime">Start Date & Time</Label>
          <Input
            id="start-datetime"
            type="datetime-local"
            value={data.startDatetime}
            onChange={e => dispatchUpdate({ startDatetime: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end-datetime">End Date & Time</Label>
          <Input
            id="end-datetime"
            type="datetime-local"
            value={data.endDatetime}
            onChange={e => dispatchUpdate({ endDatetime: e.target.value })}
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
          value={data.capacity ?? ""}
          onChange={e => dispatchUpdate({ capacity: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    </div>
  )
}

export default function CreateEventPage() {
  const currentStep = useAtom(wizardStepAtom)[0]
  const data = useAtom(wizardDataAtom)[0]
  const [, setWizardEventId] = useAtom(wizardEventIdAtom)
  const [, setIsSaving] = useAtom(wizardIsSavingAtom)
  const [, dispatchSetStep] = useAtom(setWizardStep)
  const [, dispatchReset] = useAtom(resetWizard)

  const categories = useQuery(api.categories.list)
  const createEvent = useMutation(api.events.create)
  const publishEvent = useMutation(api.events.publish)

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stepIndex = steps.findIndex(s => s.key === currentStep)

  async function handleSaveDraft() {
    setIsSaving(true)
    try {
      if (!data.title || !data.category) {
        toast.error("Title and category are required to save")
        return
      }

      const startMs = data.startDatetime ? new Date(data.startDatetime).getTime() : Date.now()
      const endMs = data.endDatetime ? new Date(data.endDatetime).getTime() : startMs + 3600000

      const venueData = data.venue
        ? {
            name: data.venue.name || "TBD",
            address: data.venue.address || "TBD",
            city: data.venue.city || "TBD",
            country: data.venue.country || "TBD",
            lat: data.venue.lat || 0,
            lng: data.venue.lng || 0,
          }
        : {
            name: "TBD",
            address: "TBD",
            city: "TBD",
            country: "TBD",
            lat: 0,
            lng: 0,
          }

      const coverPhotoData = data.coverPhoto ?? {
        url: "/placeholders/tech.svg",
        dominantColor: "#3B82F6",
        photographerName: "Placeholder",
        photographerUrl: "#",
      }

      const eventId = await createEvent({
        title: data.title,
        description: data.description ?? "TBD",
        category: data.category,
        tags: data.tags,
        venue: venueData,
        startDatetime: startMs,
        endDatetime: endMs,
        capacity: data.capacity,
        coverPhoto: coverPhotoData,
      })

      setWizardEventId(eventId)
      toast.success("Draft saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublish() {
    if (
      !data.title ||
      !data.description ||
      !data.category ||
      !data.venue ||
      !data.startDatetime ||
      !data.endDatetime
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const startMs = new Date(data.startDatetime).getTime()
      const endMs = new Date(data.endDatetime).getTime()

      const venueData = {
        name: data.venue.name,
        address: data.venue.address,
        city: data.venue.city,
        country: data.venue.country,
        lat: data.venue.lat ?? 0,
        lng: data.venue.lng ?? 0,
      }

      const coverPhotoData = data.coverPhoto ?? {
        url: "/placeholders/tech.svg",
        dominantColor: "#3B82F6",
        photographerName: "Placeholder",
        photographerUrl: "#",
      }

      const eventId = await createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        venue: venueData,
        startDatetime: startMs,
        endDatetime: endMs,
        capacity: data.capacity,
        coverPhoto: coverPhotoData,
      })

      await publishEvent({ eventId })
      dispatchReset()
      toast.success("Event published!")
      router.push(`/organizer/events/${eventId}/edit`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish event")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    const nextIndex = stepIndex + 1
    if (nextIndex < steps.length) {
      dispatchSetStep(steps[nextIndex].key)
    }
  }

  function handleBack() {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) {
      dispatchSetStep(steps[prevIndex].key)
    }
  }

  function renderStep() {
    switch (currentStep) {
      case "ai-prompt":
        return <StepAiPrompt />
      case "details":
        return <StepDetails categories={categories ?? []} />
      case "cover-photo":
        return <StepCoverPhoto />
      case "venue-schedule":
        return <StepVenueSchedule />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
          <p className="mt-1 text-muted-foreground">Build your event step by step.</p>
        </div>

        <StepIndicator currentStep={currentStep} />

        <Card>
          <CardHeader>
            <CardTitle>{steps[stepIndex]?.label}</CardTitle>
            <CardDescription>
              {stepIndex === 0 && "Let AI help you plan your event."}
              {stepIndex === 1 && "Fill in the basic details about your event."}
              {stepIndex === 2 && "Pick a cover photo that represents your event."}
              {stepIndex === 3 && "Set the venue, date, and time."}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className="mr-1 size-4" />
                Back
              </Button>
            )}
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
              <Save className="mr-1 size-4" />
              Save Draft
            </Button>
          </div>

          {stepIndex === steps.length - 1 ? (
            <Button onClick={handlePublish} disabled={isSubmitting}>
              <Rocket className="mr-1 size-4" />
              {isSubmitting ? "Publishing..." : "Publish Event"}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next
              <ArrowRight className="ml-1 size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
