"use client"

import { Suspense, useState } from "react"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { DashboardContent, DashboardContentSkeleton } from "@/features/analytics/components/DashboardContent"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EventSelector({ events }: { events: Doc<"events">[] }) {
  const [selectedId, setSelectedId] = useState(events[0]?._id)

  if (!selectedId) return null

  return (
    <div className="space-y-6">
      <Select value={selectedId} onValueChange={(value: Id<"events">) => setSelectedId(value)}>
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue placeholder="Select an event" />
        </SelectTrigger>
        <SelectContent>
          {events.map(event => (
            <SelectItem key={event._id} value={event._id}>
              {event.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardContent eventId={selectedId} />
      </Suspense>
    </div>
  )
}
