"use client"

import { useState, useMemo, Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import Link from "next/link"
import { SearchInput } from "@/features/discovery/components/SearchInput"
import { EventCard } from "@/features/events/components/EventCard"
import { Skeleton } from "@/components/ui/skeleton"

function EventsList({ events }: { events: Doc<"events">[] }) {
  const [search] = useState("")
  const [statusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    let result = [...events].sort((a, b) => b.startDatetime - a.startDatetime)

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter(e => e.status === statusFilter)
    }

    return result
  }, [events, search, statusFilter])

  if (!filtered.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No events found.</p>
      </div>
    )
  }

  const EVENT_ANALYTIC_BASE = "/dashboard/analytic/" as const

return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map(event => (
        <Link
          key={event._id}
          href={`${EVENT_ANALYTIC_BASE}${event._id}`}
          className="transition-transform hover:scale-[1.02]"
        >
          <EventCard event={event} variant="compact" />
        </Link>
      ))}
    </div>
  )
}

function EventsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-56" />
      ))}
    </div>
  )
}

export default function DashboardEventsPage() {
  const eventsResult = useQuery(api.events.getMyEvents)
  const events = eventsResult?.data ?? []

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your Events</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              View and manage all your events.
            </p>
          </div>
          <SearchInput />
        </div>

        <Suspense fallback={<EventsListSkeleton />}>
          <EventsList events={events} />
        </Suspense>
      </div>
    </div>
  )
}