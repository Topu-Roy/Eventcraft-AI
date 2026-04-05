"use client"

import { useCallback, useReducer, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { EventCoverPhotoPicker } from "@/features/events/components/EventCoverPhotoPicker"
import { EventDetailsForm } from "@/features/events/components/EventDetailsForm"
import { EventEditActions } from "@/features/events/components/EventEditActions"
import { EventEditHeader } from "@/features/events/components/EventEditHeader"
import { EventVenueScheduleForm } from "@/features/events/components/EventVenueScheduleForm"
import { eventToFormData } from "@/features/events/types"
import type { EditableFields } from "@/features/events/types"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { Skeleton } from "@/components/ui/skeleton"

type FormAction =
  | { type: "init"; data: EditableFields }
  | { type: "field"; field: keyof EditableFields; value: EditableFields[keyof EditableFields] }
  | { type: "venue"; updates: Partial<EditableFields["venue"]> }
  | { type: "addTag"; tag: string }
  | { type: "removeTag"; tag: string }

function formReducer(state: EditableFields | null, action: FormAction): EditableFields | null {
  switch (action.type) {
    case "init":
      return action.data
    case "field":
      if (!state) return null
      return { ...state, [action.field]: action.value }
    case "venue":
      if (!state) return null
      return { ...state, venue: { ...state.venue, ...action.updates } }
    case "addTag":
      if (!state || state.tags.includes(action.tag)) return state
      return { ...state, tags: [...state.tags, action.tag] }
    case "removeTag":
      if (!state) return null
      return { ...state, tags: state.tags.filter(t => t !== action.tag) }
    default:
      return state
  }
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<Id<"events"> | null>(null)
  const [formData, dispatchForm] = useReducer(formReducer, null)
  const [tagInput, setTagInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const router = useRouter()
  const categories = useQuery(api.categories.list)
  const event = useQuery(api.events.getById, eventId ? { eventId } : "skip")
  const updateEvent = useMutation(api.events.update)
  const publishEvent = useMutation(api.events.publish)
  const cancelEvent = useMutation(api.events.cancel)

  // Resolve params to eventId
  void params.then(p => {
    if (!eventId) setEventId(p.id as Id<"events">)
  })

  // Initialize form data when event loads — use key to reset on event change
  const currentEventId = event?._id
  const [lastSyncedId, setLastSyncedId] = useState<string | null>(null)
  if (currentEventId && currentEventId !== lastSyncedId) {
    setLastSyncedId(currentEventId)
    dispatchForm({ type: "init", data: eventToFormData(event) })
  }

  const updateField = useCallback(<K extends keyof EditableFields>(field: K, value: EditableFields[K]) => {
    dispatchForm({ type: "field", field, value })
  }, [])

  const updateVenue = useCallback((updates: Partial<EditableFields["venue"]>) => {
    dispatchForm({ type: "venue", updates })
  }, [])

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (trimmed) {
      dispatchForm({ type: "addTag", tag: trimmed })
      setTagInput("")
    }
  }, [tagInput])

  const removeTag = useCallback((tag: string) => {
    dispatchForm({ type: "removeTag", tag })
  }, [])

  async function handleSave() {
    if (!formData || !eventId) return
    if (!formData.title || !formData.category) {
      toast.error("Title and category are required")
      return
    }

    setIsSaving(true)
    const startMs = formData.startDatetime ? new Date(formData.startDatetime).getTime() : 0
    const endMs = formData.endDatetime ? new Date(formData.endDatetime).getTime() : startMs + 3600000

    const result = await tryCatch(
      updateEvent({
        eventId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        venue: formData.venue,
        startDatetime: startMs,
        endDatetime: endMs,
        capacity: formData.capacity,
        coverPhoto: formData.coverPhoto ?? undefined,
      })
    )

    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.error) {
      toast.error(result.data.cause)
    } else {
      toast.success("Event saved")
    }
    setIsSaving(false)
  }

  async function handlePublish() {
    if (!eventId) return
    const result = await tryCatch(publishEvent({ eventId }))
    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.error) {
      toast.error(result.data.cause)
    } else {
      toast.success("Event published!")
      router.push(`/events/${eventId}`)
    }
  }

  async function handleCancel() {
    if (!eventId) return
    const result = await tryCatch(cancelEvent({ eventId }))
    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.error) {
      toast.error(result.data.cause)
    } else {
      toast.success("Event cancelled")
      router.push(`/events/${eventId}`)
    }
  }

  if (!event && eventId) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!formData || !event) {
    return null
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <EventEditHeader
          event={event}
          isSaving={isSaving}
          onSave={handleSave}
          onPublish={handlePublish}
          onCancelEvent={() => setShowDeleteDialog(true)}
        />

        <EventDetailsForm
          formData={formData}
          categories={categories}
          tagInput={tagInput}
          onTagInputChange={setTagInput}
          onFieldChange={updateField}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />

        <EventCoverPhotoPicker formData={formData} onPhotoSelect={photo => updateField("coverPhoto", photo)} />

        <EventVenueScheduleForm formData={formData} onFieldChange={updateField} onVenueChange={updateVenue} />

        <EventEditActions
          event={event}
          isSaving={isSaving}
          showDeleteDialog={showDeleteDialog}
          onSave={handleSave}
          onPublish={handlePublish}
          onCancel={handleCancel}
          onDeleteDialogChange={setShowDeleteDialog}
        />
      </div>
    </div>
  )
}
