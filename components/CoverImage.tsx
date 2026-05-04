"use client"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { CalendarDays } from "lucide-react"
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
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 ${className}`}>
        <CalendarDays className="size-8 text-white/70" />
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 ${className}`}>
        <CalendarDays className="size-8 text-white/70" />
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
