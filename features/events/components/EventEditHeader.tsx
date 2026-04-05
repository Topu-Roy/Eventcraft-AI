"use client"

import type { Doc } from "@/convex/_generated/dataModel"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type EventEditHeaderProps = {
  event: Doc<"events">
  isSaving: boolean
  onSave: () => void
  onPublish: () => void
  onCancelEvent: () => void
}

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

export function EventEditHeader({ event, isSaving, onSave, onPublish, onCancelEvent }: EventEditHeaderProps) {
  const router = useRouter()
  const status = STATUS_LABELS[event.status] ?? { label: event.status, variant: "outline" as const }
  const description = STATUS_DESCRIPTIONS[event.status] ?? ""

  return (
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
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {event.status === "draft" ? (
          <Button variant="outline" onClick={onPublish}>
            Publish
          </Button>
        ) : null}
        {event.status === "published" ? (
          <Button variant="destructive" onClick={onCancelEvent}>
            <Trash2 className="mr-1 size-4" />
            Cancel Event
          </Button>
        ) : null}
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="mr-1 size-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
