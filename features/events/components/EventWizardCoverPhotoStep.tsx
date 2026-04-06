"use client"

import { useCallback, useRef, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { updateWizardData, wizardDataAtom } from "@/features/events/eventWizard"
import { useMutation, useQuery } from "convex/react"
import { useAtom } from "jotai"
import { Camera, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_MB = 10

function getDominantColor(file: File): Promise<string> {
  return new Promise(resolve => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve("#3B82F6")
        return
      }
      ctx.drawImage(img, 0, 0, 1, 1)
      const data = ctx.getImageData(0, 0, 1, 1).data
      resolve(`rgb(${data[0]}, ${data[1]}, ${data[2]})`)
    }
    img.onerror = () => resolve("#3B82F6")
    img.src = URL.createObjectURL(file)
  })
}

export function EventWizardCoverPhotoStep() {
  const wizardData = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdateWizardData] = useAtom(updateWizardData)
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const storageId = wizardData.coverPhoto?.storageId
  const uploadedImageUrl = useQuery(api.storage.getUrl, storageId ? { storageId } : "skip")

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error("Only JPEG, PNG, and WebP images are accepted.")
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`Image must be under ${MAX_SIZE_MB}MB.`)
        return
      }

      setIsUploading(true)
      const previewUrl = URL.createObjectURL(file)
      const dominantColor = await getDominantColor(file)

      dispatchUpdateWizardData({
        coverPhoto: {
          storageId: null,
          previewUrl,
        },
        themeColor: dominantColor,
      })

      try {
        const uploadUrl = await generateUploadUrl()
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })

        const { storageId } = (await result.json()) as { storageId: Id<"_storage"> }
        URL.revokeObjectURL(previewUrl)

        dispatchUpdateWizardData({
          coverPhoto: {
            storageId,
            previewUrl: null,
          },
          themeColor: dominantColor,
        })
        toast.success("Cover photo uploaded!")
      } catch {
        toast.error("Failed to upload image. Please try again.")
        dispatchUpdateWizardData({
          coverPhoto: {
            storageId: null,
            previewUrl,
          },
          themeColor: dominantColor,
        })
      } finally {
        setIsUploading(false)
      }
    },
    [generateUploadUrl, dispatchUpdateWizardData]
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFileSelect(file)
    e.target.value = ""
  }

  function handleRemovePhoto() {
    if (wizardData.coverPhoto?.previewUrl) {
      URL.revokeObjectURL(wizardData.coverPhoto.previewUrl)
    }
    dispatchUpdateWizardData({
      coverPhoto: {
        storageId: null,
        previewUrl: null,
      },
      themeColor: "",
    })
  }

  const hasPhoto = wizardData.coverPhoto?.storageId !== null || wizardData.coverPhoto?.previewUrl !== null
  const displayUrl = wizardData.coverPhoto?.previewUrl ?? null

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Upload a cover photo</h2>
        <p className="text-sm text-muted-foreground">
          Upload an image from your device. JPEG, PNG, or WebP up to {MAX_SIZE_MB}MB.
        </p>
      </div>

      {hasPhoto ? (
        <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-primary/20">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="Cover preview" className="size-full object-cover" />
          ) : wizardData.coverPhoto?.storageId && uploadedImageUrl ? (
            <Image
              src={uploadedImageUrl}
              alt="Cover preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ backgroundColor: wizardData.themeColor || "hsl(var(--muted))" }}
            >
              <Camera className="size-12 text-primary-foreground/50" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Replace photo"
            >
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              aria-label="Remove photo"
            >
              <X className="size-4" />
            </Button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-colors hover:border-primary/50"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-10 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Camera className="size-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP · Max {MAX_SIZE_MB}MB</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
