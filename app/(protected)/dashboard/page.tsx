"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { EventSelector } from "@/features/events/components/EventSelector"
import { EventGrid } from "@/features/discovery/components/EventGrid"
import { BarChart3, Plus, Ticket } from "lucide-react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardAnimations } from "@/components/ui/DashboardAnimations"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

function EventSummaryCard({ event, now }: { event: Doc<"events">; now: number }) {
  const status = statusLabels[event.status] ?? { label: event.status, variant: "outline" as const }
  const isPast = event.startDatetime < now
  const capacityInfo =
    event.capacity === undefined ? "Unlimited" : event.capacity - event.registrationCount <= 0 ? "Sold out" : `${event.capacity - event.registrationCount} spots left`

  return (
    <Link href={`/events/${event._id}`} className="dash-event-card block">
      <Card className="group transition-all hover:border-primary/50 hover:shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{event.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {event.venue.city}, {event.venue.country}
                </span>
                <span>{event.registrationCount} registered</span>
                <span>{capacityInfo}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              {isPast && <Badge variant="outline">Ended</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const now = Date.now()
  const eventsResult = useQuery(api.events.getMyEvents)
  const planUsageResult = useQuery(api.events.getPlanUsage)

  const events = eventsResult?.data ?? []
  const planUsage = planUsageResult?.data

  const activeEvents = events.filter(e => e.status === "published" || e.status === "draft")
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrationCount, 0)

  if (!events.length) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage your events and track performance.</p>
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
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage your events and track performance.</p>
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

          <EventGrid title="Your Events" events={events} showPagination={events.length > 12} />

          <div className="dash-section">
            <EventSelector events={events} />
          </div>
        </div>
      </div>
    </DashboardAnimations>
  )
}