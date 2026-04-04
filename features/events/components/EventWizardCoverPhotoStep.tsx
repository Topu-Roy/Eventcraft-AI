"use client"

import { PLACEHOLDER_PHOTOS } from "@/features/events/constants"
import { updateWizardData, wizardDataAtom } from "@/features/events/eventWizard"
import { useAtom } from "jotai"
import { ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function EventWizardCoverPhotoStep() {
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
