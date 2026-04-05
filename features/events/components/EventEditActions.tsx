"use client"

import type { Doc } from "@/convex/_generated/dataModel"
import { Save, Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"

type EventEditActionsProps = {
  event: Doc<"events">
  isSaving: boolean
  showDeleteDialog: boolean
  onSave: () => void
  onPublish: () => void
  onCancel: () => void
  onDeleteDialogChange: (open: boolean) => void
}

export function EventEditActions({
  event,
  isSaving,
  showDeleteDialog,
  onSave,
  onPublish,
  onCancel,
  onDeleteDialogChange,
}: EventEditActionsProps) {
  return (
    <>
      <div className="flex justify-end gap-2 pb-8">
        {event.status === "draft" ? (
          <Button variant="outline" onClick={onPublish}>
            Publish
          </Button>
        ) : null}
        {event.status === "published" ? (
          <Button variant="destructive" onClick={() => onDeleteDialogChange(true)}>
            <Trash2 className="mr-1 size-4" />
            Cancel Event
          </Button>
        ) : null}
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="mr-1 size-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
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
              onClick={onCancel}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Cancel Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
