"use client"

import type { Doc } from "@/convex/_generated/dataModel"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function EventCard({ event }: { event: Doc<"events"> }) {
  const date = new Date(event.startDatetime)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Link
      href={`/events/${event._id}`}
      className="flex w-72 shrink-0 flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-video items-center justify-center bg-muted">
        {event.coverPhoto ? (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: event.coverPhoto.dominantColor }}
          >
            <span className="text-sm text-white/80">{event.title}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No cover</span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="truncate text-sm font-semibold">{event.title}</h3>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
        <p className="truncate text-xs text-muted-foreground">
          {event.venue.city}, {event.venue.country}
        </p>
      </div>
    </Link>
  )
}

export function EventCarousel({
  title,
  events,
  emptyMessage,
}: {
  title: string
  events: Doc<"events">[]
  emptyMessage: string
}) {
  if (!events.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Badge variant="secondary">{events.length} events</Badge>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {events.map(event => (
          <div key={event._id} className="snap-start">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventCarouselSkeleton(_props: { title: string }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-32" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-72 shrink-0 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
