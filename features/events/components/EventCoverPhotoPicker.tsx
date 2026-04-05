"use client"

import { PLACEHOLDER_PHOTOS } from "@/features/events/constants"
import type { EditableFields } from "@/features/events/types"
import { ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type EventCoverPhotoPickerProps = {
  formData: EditableFields
  onPhotoSelect: (photo: NonNullable<EditableFields["coverPhoto"]>) => void
}

export function EventCoverPhotoPicker({ formData, onPhotoSelect }: EventCoverPhotoPickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="size-5" />
          Cover Photo
        </CardTitle>
        <CardDescription>Select a cover image for your event.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {PLACEHOLDER_PHOTOS.map(photo => {
            const isSelected = formData.coverPhoto?.url === photo.url
            return (
              <button
                key={photo.url}
                type="button"
                className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
                onClick={() => onPhotoSelect(photo)}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: photo.dominantColor }}
                >
                  <ImageIcon className="size-6 text-primary-foreground/80" aria-hidden="true" />
                </div>
                {isSelected ? (
                  <div className="absolute top-1 right-1">
                    <Badge variant="default" className="px-1 py-0 text-[10px]">
                      ✓
                    </Badge>
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
