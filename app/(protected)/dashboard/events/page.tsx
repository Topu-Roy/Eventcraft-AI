"use client"

import { Suspense, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { SearchInput } from "@/features/discovery/components/SearchInput"
import { EventCard } from "@/features/events/components/EventCard"
import { useQuery } from "convex/react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

function EventsList({ events }: { events: Doc<"events">[] }) {
  const [search] = useState("")
  const [statusFilter] = useState<string>("all")

  const filtered = [...events]
    .sort((a, b) => b.startDatetime - a.startDatetime)
    .filter(e => (!search || e.title.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase())) && (statusFilter === "all" || e.status === statusFilter))

  if (!filtered.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No events found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map(event => (
        <Link
          key={event._id}
          href={`/dashboard/analytic/${event._id}`}
          className="transition-transform hover:scale-[1.02]"
        >
          <EventCard event={event} variant="compact" disableLink />
        </Link>
      ))}
    </div>
  )
}

function EventsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`event-skelton-${i}`} className="flex flex-1 flex-col gap-2 p-3">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full rounded-none" />
            <Skeleton className="h-4 w-2/3 rounded-none" />
          </div>

          <div className="flex flex-1 flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-3.5 shrink-0 rounded-none" />
              <Skeleton className="h-3 w-32 rounded-none" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-3.5 shrink-0 rounded-none" />
              <Skeleton className="h-3 w-24 rounded-none" />
            </div>
          </div>
        </div>
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
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">View and manage all your events.</p>
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
