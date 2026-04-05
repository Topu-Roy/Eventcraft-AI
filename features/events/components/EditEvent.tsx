"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { EventEditForm } from "@/features/events/components/EventEditForm"
import { useMutation, useQuery } from "convex/react"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  draft: "Complete the details and publish when ready.",
  published: "This event is live. Changes will be visible immediately.",
  completed: "This event has ended.",
  cancelled: "This event is no longer active.",
}

export function EditEvent({ eventId }: { eventId: string }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [lastSyncedId, setLastSyncedId] = useState<string | null>(null)

  const router = useRouter()
  const event = useQuery(api.events.getById, eventId ? { eventId: eventId as Id<"events"> } : "skip")
  const publishEvent = useMutation(api.events.publish)
  const cancelEvent = useMutation(api.events.cancel)

  // Track when event data has been synced
  const currentEventId = event?._id
  if (currentEventId && currentEventId !== lastSyncedId) {
    setLastSyncedId(currentEventId)
  }

  async function handlePublish() {
    if (!eventId) return
    const result = await tryCatch(publishEvent({ eventId: eventId as Id<"events"> }))
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
    const result = await tryCatch(cancelEvent({ eventId: eventId as Id<"events"> }))
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

  if (!event) {
    return null
  }

  const status = STATUS_LABELS[event.status] ?? { label: event.status, variant: "outline" as const }
  const statusDescription = STATUS_DESCRIPTIONS[event.status] ?? ""

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-1 size-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{statusDescription}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {event.status === "draft" ? (
              <Button variant="outline" onClick={handlePublish}>
                Publish
              </Button>
            ) : null}
            {event.status === "published" ? (
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-1 size-4" />
                Cancel Event
              </Button>
            ) : null}
          </div>
        </div>

        {eventId ? <EventEditForm eventId={eventId as Id<"events">} event={event} /> : null}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel the event and notify all registered attendees. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Event</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              >
                Cancel Event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
