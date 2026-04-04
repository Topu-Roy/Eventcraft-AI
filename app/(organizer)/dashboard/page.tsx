import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { BarChart3, Plus, Ticket } from "lucide-react"
import Link from "next/link"
import { fetchAuthQuery } from "@/lib/auth-server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EventSelector } from "./EventSelector"

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

function EventSummaryCard({ event, now }: { event: Doc<"events">; now: number }) {
  const status = statusLabels[event.status] ?? { label: event.status, variant: "outline" }
  const isPast = event.startDatetime < now
  const capacityInfo =
    event.capacity === null
      ? "Unlimited"
      : event.capacity - event.registrationCount <= 0
        ? "Sold out"
        : `${event.capacity - event.registrationCount} spots left`

  return (
    <Link href={`/events/${event._id}/edit`} className="block">
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

async function getNow(): Promise<number> {
  return new Date().getTime()
}

export default async function DashboardPage() {
  const now = await getNow()
  const events = await fetchAuthQuery(api.events.getMyEvents)
  const planUsage = await fetchAuthQuery(api.events.getPlanUsage)

  const activeEvents = events?.filter(e => e.status === "published" || e.status === "draft") ?? []
  const totalRegistrations = events?.reduce((sum, e) => sum + e.registrationCount, 0) ?? 0

  if (!events?.length) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Manage your events and track performance.</p>
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage your events and track performance.</p>
          </div>
          <div className="flex items-center gap-3">
            {planUsage && (
              <span className="text-sm text-muted-foreground">
                {planUsage.activeCount} of {planUsage.limit === Infinity ? "∞" : planUsage.limit} events used
              </span>
            )}
            <Button asChild>
              <Link href="/events/create">
                <Plus className="mr-2 size-4" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeEvents.length}</p>
                <p className="text-xs text-muted-foreground">Active events</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Ticket className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRegistrations}</p>
                <p className="text-xs text-muted-foreground">Total registrations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-xs text-muted-foreground">All events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Events</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map(event => (
              <EventSummaryCard key={event._id} event={event} now={now} />
            ))}
          </div>
        </div>

        <Suspense>
          <EventSelector events={events} />
        </Suspense>
      </div>
    </div>
  )
}
