import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { Calendar, MapPin, Users } from "lucide-react"
import { notFound } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RegistrationCTA } from "./RegistrationCTA"

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function EventHeader({ event }: { event: Doc<"events"> }) {
  const isCancelled = event.status === "cancelled"
  const isPast = event.status === "completed"

  return (
    <div className="relative">
      <div
        className={`aspect-video w-full rounded-lg ${isCancelled ? "opacity-50 saturate-0" : ""}`}
        style={{ backgroundColor: event.coverPhoto?.dominantColor ?? "#3B82F6" }}
      />
      <div className="absolute top-4 left-4 flex gap-2">
        {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
        {isPast && <Badge variant="secondary">Ended</Badge>}
        {!isCancelled && !isPast && <Badge variant="outline">{event.category}</Badge>}
      </div>
      <h1 className={`mt-4 text-3xl font-bold tracking-tight ${isCancelled ? "line-through opacity-60" : ""}`}>
        {event.title}
      </h1>
    </div>
  )
}

function EventInfo({ event }: { event: Doc<"events"> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Calendar className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium">{formatDate(event.startDatetime)}</p>
          <p className="text-sm text-muted-foreground">
            {formatTime(event.startDatetime)} - {formatTime(event.endDatetime)}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium">{event.venue.name}</p>
          <p className="text-sm text-muted-foreground">
            {event.venue.address}, {event.venue.city}, {event.venue.country}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Users className="size-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {event.registrationCount} registered
          {event.capacity !== null && ` / ${event.capacity}`}
        </p>
      </div>
    </div>
  )
}

function EventDescription({ description }: { description: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <h2 className="text-lg font-semibold">About this event</h2>
      <p className="whitespace-pre-wrap text-muted-foreground">{description}</p>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

async function EventSidebar({
  eventId,
  isOrganizer,
  isRegistered,
}: {
  eventId: Id<"events">
  isOrganizer: boolean
  isRegistered: boolean
}) {
  const event = await fetchAuthQuery(api.events.getById, { eventId })
  if (!event) return null

  return (
    <Card className="sticky top-4">
      <CardContent className="space-y-4 p-6">
        <EventInfo event={event} />
        <RegistrationCTA
          eventId={eventId}
          isOrganizer={isOrganizer}
          isRegistered={isRegistered}
          isFull={event.capacity !== null && event.registrationCount >= event.capacity}
          isPast={event.status === "completed"}
          isCancelled={event.status === "cancelled"}
        />
      </CardContent>
    </Card>
  )
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const eventId = id as Id<"events">

  const detail = await fetchAuthQuery(api.discovery.getEventDetail, { eventId })

  if (!detail) {
    notFound()
  }

  const { event, isOrganizer, isRegistered } = detail

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <EventHeader event={event} />
            <EventDescription description={event.description} />
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<SidebarSkeleton />}>
              <EventSidebar eventId={eventId} isOrganizer={isOrganizer} isRegistered={isRegistered} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 border-t bg-background p-4 lg:hidden">
        <RegistrationCTA
          eventId={eventId}
          isOrganizer={isOrganizer}
          isRegistered={isRegistered}
          isFull={event.capacity !== null && event.registrationCount >= event.capacity}
          isPast={event.status === "completed"}
          isCancelled={event.status === "cancelled"}
        />
      </div>
    </div>
  )
}
