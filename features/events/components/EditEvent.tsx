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

  const router = useRouter()
  const eventQuery = useQuery(api.events.getById, eventId ? { eventId: eventId as Id<"events"> } : "skip")
  const event = eventQuery?.data ?? null
  const hasError = eventQuery?.error ?? false
  const publishEvent = useMutation(api.events.publish)
  const cancelEvent = useMutation(api.events.cancel)

  if (!event || hasError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-2 text-center">
          <p className="text-muted-foreground">Unable to load event</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const status = STATUS_LABELS[event.status] ?? { label: event.status, variant: "outline" as const }
  const statusDescription = STATUS_DESCRIPTIONS[event.status] ?? ""

  async function handlePublish() {
    if (!eventId) return
    const result = await tryCatch(publishEvent({ eventId: eventId as Id<"events"> }))
    if (result.error || result.data?.error) {
      toast.error(result.data?.message ?? "Failed to publish")
    } else {
      toast.success("Event published!")
    }
  }

  async function handleCancel() {
    if (!eventId) return
    setShowDeleteDialog(false)
    const result = await tryCatch(cancelEvent({ eventId: eventId as Id<"events"> }))
    if (result.error || result.data?.error) {
      toast.error(result.data?.message ?? "Failed to cancel event")
    } else {
      toast.success("Event cancelled")
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-1 size-4" />
              Back
            </Button>
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

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{statusDescription}</p>
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
