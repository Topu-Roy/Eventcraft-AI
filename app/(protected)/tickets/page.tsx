import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { ArrowRight, Calendar, Clock, MapPin, Ticket, Users } from "lucide-react"
import Link from "next/link"
import { fetchAuthQuery } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

type TicketRegistration = Doc<"registrations"> & { event: Doc<"events"> }

const ONE_HOUR_IN_MS = 60 * 60 * 1000

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

function isEventPast(eventEndTimestamp: number, currentTimestamp: number): boolean {
  return eventEndTimestamp < currentTimestamp
}

function isEventSoon(eventStartTimestamp: number, currentTimestamp: number): boolean {
  const timeUntilStart = eventStartTimestamp - currentTimestamp
  return timeUntilStart < ONE_HOUR_IN_MS && timeUntilStart > 0
}

function getRegistrationStatusBadge(registration: TicketRegistration): "destructive" | "default" | "secondary" {
  if (registration.status === "cancelled") return "destructive"
  if (registration.checkedIn) return "default"
  return "secondary"
}

function getRegistrationStatusText(registration: TicketRegistration): string {
  if (registration.status === "cancelled") return "Cancelled"
  if (registration.checkedIn) return "Checked In"
  return "Active"
}

function TicketCard({
  registration,
  currentTimestamp,
}: {
  registration: TicketRegistration
  currentTimestamp: number
}) {
  const event = registration.event
  const isPastEvent = isEventPast(event.endDatetime, currentTimestamp)
  const isUpcomingSoon = isEventSoon(event.startDatetime, currentTimestamp)
  const statusBadgeVariant = getRegistrationStatusBadge(registration)
  const statusText = getRegistrationStatusText(registration)

  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
      <div
        className="relative aspect-video w-full"
        style={{ backgroundColor: event.themeColor ?? "hsl(var(--muted))" }}
      >
        {isPastEvent ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="text-xs font-medium text-muted-foreground">Ended</span>
          </div>
        ) : null}
        {isUpcomingSoon && !registration.checkedIn ? (
          <Badge className="absolute top-2 right-2 animate-pulse" variant="destructive">
            Starting soon
          </Badge>
        ) : null}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{event.title}</CardTitle>
          <Badge variant={statusBadgeVariant}>{statusText}</Badge>
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
          <Link href={`/tickets/${registration.ticketCode}`} className="flex-1">
            <Button variant="default" className="w-full" disabled={registration.status === "cancelled"}>
              <Ticket className="mr-2 size-4" />
              {registration.status === "cancelled" ? "Cancelled" : "View Ticket"}
            </Button>
          </Link>
          {!isPastEvent && registration.status === "active" ? (
            <Link href={`/events/${event._id}`}>
              <Button variant="outline" size="icon" aria-label="View event details">
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          ) : null}
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

function TicketsEmptyState() {
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

function TicketListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <TicketCardSkeleton key={index} />
      ))}
    </div>
  )
}

async function getCurrentTimestamp(): Promise<number> {
  return new Date().getTime()
}

async function TicketList() {
  const currentTimestamp = await getCurrentTimestamp()
  const result = await tryCatch(fetchAuthQuery(api.registrations.getMyRegistrations))

  if (result.error || (result.data as any)?.error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load tickets. Please try again later.
        </CardContent>
      </Card>
    )
  }

  const registrations: TicketRegistration[] = (result.data as any)?.data ?? []
  const validRegistrations = registrations?.filter((reg): reg is TicketRegistration => reg.event != null)

  if (!validRegistrations?.length) {
    return <TicketsEmptyState />
  }

  const activeTicketCount = validRegistrations.filter(
    reg => reg.status === "active" && !isEventPast(reg.event.endDatetime, currentTimestamp)
  ).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {activeTicketCount} active ticket{activeTicketCount !== 1 ? "s" : ""}
        </span>
        <span>{validRegistrations.length} total</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {validRegistrations.map(registration => (
          <TicketCard key={registration._id} registration={registration} currentTimestamp={currentTimestamp} />
        ))}
      </div>
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
