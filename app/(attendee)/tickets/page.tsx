import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { ArrowRight, Calendar, Clock, MapPin, Ticket, Users } from "lucide-react"
import Link from "next/link"
import { fetchAuthQuery } from "@/lib/auth-server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

function formatEventDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatEventTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function isEventPast(endDatetime: number): boolean {
  return endDatetime < Date.now()
}

function isEventSoon(startDatetime: number): boolean {
  const oneHour = 60 * 60 * 1000
  return startDatetime - Date.now() < oneHour && startDatetime > Date.now()
}

function TicketCard({ reg }: { reg: { event: Doc<"events"> } & Doc<"registrations"> }) {
  const event = reg.event
  const past = isEventPast(event.endDatetime)
  const soon = isEventSoon(event.startDatetime)

  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
      <div
        className="relative aspect-video w-full"
        style={{ backgroundColor: event.coverPhoto?.dominantColor ?? "hsl(var(--muted))" }}
      >
        {past && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="text-xs font-medium text-muted-foreground">Ended</span>
          </div>
        )}
        {soon && !reg.checkedIn && (
          <Badge className="absolute top-2 right-2 animate-pulse" variant="destructive">
            Starting soon
          </Badge>
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{event.title}</CardTitle>
          <Badge variant={reg.status === "cancelled" ? "destructive" : reg.checkedIn ? "default" : "secondary"}>
            {reg.status === "cancelled" ? "Cancelled" : reg.checkedIn ? "Checked In" : "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            <span>{formatEventDate(event.startDatetime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            <span>{formatEventTime(event.startDatetime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 shrink-0" />
            <span>
              {event.capacity === null
                ? "Unlimited capacity"
                : `${event.registrationCount}/${event.capacity} registered`}
            </span>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Link href={`/tickets/${reg.ticketCode}`} className="flex-1">
            <Button variant="default" className="w-full" disabled={reg.status === "cancelled"}>
              <Ticket className="mr-2 size-4" />
              {reg.status === "cancelled" ? "Cancelled" : "View Ticket"}
            </Button>
          </Link>
          {!past && reg.status === "active" && (
            <Link href={`/events/${event._id}`}>
              <Button variant="outline" size="icon">
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TicketCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

async function TicketList() {
  const registrations = await fetchAuthQuery(api.registrations.getMyRegistrations)
  const validRegistrations = registrations?.filter(r => r.event) as
    | (Doc<"registrations"> & { event: Doc<"events"> })[]
    | undefined

  if (!validRegistrations?.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ticket className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No tickets yet</EmptyTitle>
        </EmptyHeader>
        <EmptyDescription>Register for events to see your tickets here.</EmptyDescription>
        <EmptyContent>
          <Link href="/explore">
            <Button>
              Explore Events
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    )
  }

  const activeCount = validRegistrations.filter(
    r => r.status === "active" && !isEventPast(r.event.endDatetime)
  ).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {activeCount} active ticket{activeCount !== 1 ? "s" : ""}
        </span>
        <span>{validRegistrations.length} total</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {validRegistrations.map(reg => (
          <TicketCard key={reg._id} reg={reg} />
        ))}
      </div>
    </div>
  )
}

function TicketListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function MyTicketsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
          <p className="mt-1 text-muted-foreground">Manage your event tickets and check-in status.</p>
        </div>

        <Suspense fallback={<TicketListSkeleton />}>
          <TicketList />
        </Suspense>
      </div>
    </div>
  )
}
