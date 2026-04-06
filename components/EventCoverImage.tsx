"use client"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { Camera } from "lucide-react"
import Image from "next/image"

type EventCoverImageProps = {
  storageId: Id<"_storage"> | null | undefined
  themeColor: string | null | undefined
  title: string
  className?: string
}

export function EventCoverImage({ storageId, themeColor, title, className }: EventCoverImageProps) {
  const imageUrl = useQuery(api.storage.getUrl, storageId ? { storageId } : "skip")

  if (!storageId && !themeColor) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Camera className="size-12 text-muted-foreground" />
      </div>
    )
  }

  if (!storageId || !imageUrl) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: themeColor ?? "hsl(var(--muted))" }}
      >
        <span className="text-lg font-medium text-primary-foreground/80">{title}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
