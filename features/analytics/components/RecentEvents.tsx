"use client"

import { useState } from "react"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { EventCard } from "@/features/events/components/EventCard"
import { cn } from "@/lib/utils"

interface RecentEventsProps {
  events: Doc<"events">[]
  selectedId?: Id<"events">
  onSelect: (id: Id<"events">) => void
}

export function RecentEvents({ events, selectedId, onSelect }: RecentEventsProps) {
  const recent = events
    .sort((a, b) => b.startDatetime - a.startDatetime)
    .slice(0, 4)

  if (!recent.length) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {recent.map(event => (
        <button
          key={event._id}
          onClick={() => onSelect(event._id)}
          className={cn(
            "relative text-left transition-all hover:border-primary/50 hover:shadow-md",
            selectedId === event._id
              ? "ring-2 ring-primary border-primary"
              : "border bg-card hover:bg-accent/50",
            "rounded-lg border bg-card"
          )}
        >
          <EventCard event={event} variant="compact" />
        </button>
      ))}
    </div>
  )
}