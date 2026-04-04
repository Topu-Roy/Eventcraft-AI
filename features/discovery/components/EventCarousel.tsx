import type { Doc } from "@/convex/_generated/dataModel"
import { EventCard } from "@/features/events/components/EventCard"
import { Skeleton } from "@/components/ui/skeleton"

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
        <span className="text-sm text-muted-foreground">{events.length} events</span>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {events.map(event => (
          <div key={event._id} className="snap-start">
            <EventCard event={event} variant="compact" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventCarouselSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-32" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-64 shrink-0" />
        ))}
      </div>
    </div>
  )
}
