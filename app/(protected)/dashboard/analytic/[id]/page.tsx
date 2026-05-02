"use client"

import { useEffect, useState, Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { DashboardContent, DashboardContentSkeleton } from "@/features/analytics/components/DashboardContent"
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardAnalyticPage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<Id<"events"> | null>(null)

  useEffect(() => {
    void params.then(resolved => setEventId(resolved.id as Id<"events">))
  }, [params])

  const eventResult = useQuery(api.events.getById, eventId ? { eventId } : "skip")
  const event = eventResult?.data

  if (!eventId) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            ← Back to dashboard
          </Link>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-1 size-4" />
          Back to dashboard
        </Link>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {event.title}
            </h1>
            <Badge variant={event.status === "published" ? "default" : "secondary"}>
              {event.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-4" />
              {new Date(event.startDatetime).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" />
              {event.venue.city}, {event.venue.country}
            </span>
          </div>
        </div>

        <Suspense fallback={<DashboardContentSkeleton />}>
          <DashboardContent eventId={eventId} />
        </Suspense>
      </div>
    </div>
  )
}