"use client"

import { Suspense, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { DashboardContent, DashboardContentSkeleton } from "@/features/analytics/components/DashboardContent"
import { RecentEvents } from "@/features/analytics/components/RecentEvents"
import { useQuery } from "convex/react"
import { BarChart3, Plus, Ticket } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardAnimations } from "@/components/ui/DashboardAnimations"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="size-10" />
                <div>
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="mt-1 h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const eventsResult = useQuery(api.events.getMyEvents)
  const planUsageResult = useQuery(api.events.getPlanUsage)

  const isLoading = eventsResult === undefined
  const events = eventsResult?.data ?? []
  const planUsage = planUsageResult?.data

  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | undefined>(
    events.length > 0 ? undefined : undefined
  )

  const activeEvents = events.filter(e => e.status === "published" || e.status === "draft")
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrationCount, 0)

  const recent = [...events].sort((a, b) => b.startDatetime - a.startDatetime).slice(0, 4)
  const defaultSelected = selectedEventId ?? (recent.length > 0 ? recent[0]._id : undefined)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!events.length) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Manage your events and track performance.
              </p>
            </div>
          </div>

          <div className="space-y-4 py-12 text-center">
            <Ticket className="mx-auto size-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No events yet</h2>
            <p className="text-muted-foreground">Create your first event to see your dashboard.</p>
            <Button asChild>
              <Link href="/events/create">
                <Plus className="mr-2 size-4" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardAnimations>
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Manage your events and track performance.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {planUsage && (
                <span className="text-sm text-muted-foreground">
                  {planUsage.activeCount} of {planUsage.limit === Infinity ? "∞" : planUsage.limit} events used
                </span>
              )}
              <Button asChild className="min-h-10">
                <Link href="/events/create">
                  <Plus className="mr-2 size-4" />
                  Create Event
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="dash-stat">
              <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-10">
                  <BarChart3 className="size-4 text-primary sm:size-5" />
                </div>
                <div>
                  <p className="text-xl font-bold sm:text-2xl">{activeEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Active events</p>
                </div>
              </CardContent>
            </Card>
            <Card className="dash-stat">
              <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-10">
                  <Ticket className="size-4 text-primary sm:size-5" />
                </div>
                <div>
                  <p className="text-xl font-bold sm:text-2xl">{totalRegistrations}</p>
                  <p className="text-xs text-muted-foreground">Total registrations</p>
                </div>
              </CardContent>
            </Card>
            <Card className="dash-stat">
              <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-10">
                  <BarChart3 className="size-4 text-primary sm:size-5" />
                </div>
                <div>
                  <p className="text-xl font-bold sm:text-2xl">{events.length}</p>
                  <p className="text-xs text-muted-foreground">All events</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Recent Events</h2>
              <Link href="/dashboard/events" className="text-sm text-primary hover:underline">
                View all events →
              </Link>
            </div>
            <RecentEvents events={events} selectedId={defaultSelected} onSelect={setSelectedEventId} />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
            <Suspense fallback={<DashboardContentSkeleton />}>
              {defaultSelected ? (
                <DashboardContent eventId={defaultSelected} />
              ) : (
                <p className="text-muted-foreground">Select an event to view analytics.</p>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardAnimations>
  )
}
