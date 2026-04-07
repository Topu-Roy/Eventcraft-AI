"use client"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { Camera } from "lucide-react"
import Image from "next/image"

type CoverImageProps = {
  storageId: Id<"_storage"> | null | undefined
  alt: string
  className?: string
}

export function CoverImage({ storageId, alt, className }: CoverImageProps) {
  const imageUrl = useQuery(api.storage.getUrl, storageId ? { storageId } : "skip")

  if (!storageId) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Camera className="size-8 text-muted-foreground" />
      </div>
    )
  }

  if (!storageId || !imageUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Camera className="size-8 text-primary-foreground/50" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
