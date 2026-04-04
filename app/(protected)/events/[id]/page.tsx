import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { RegistrationCTA } from "@/features/events/components/RegistrationCTA"
import { Calendar, Clock, MapPin, Share2, Tag, Users } from "lucide-react"
import { notFound } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const categoryColors: Record<string, string> = {
  technology: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  music: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "art-design": "bg-pink-500/10 text-pink-500 border-pink-500/20",
  sports: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "food-drink": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  business: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  "health-wellness": "bg-green-500/10 text-green-500 border-green-500/20",
  education: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "social-community": "bg-teal-500/10 text-teal-500 border-teal-500/20",
  gaming: "bg-violet-500/10 text-violet-500 border-violet-500/20",
}

function getCategoryBadge(category: string) {
  const colorClass = categoryColors[category] ?? "bg-muted text-muted-foreground border-border"
  const label = category
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return (
    <Badge variant="outline" className={`border ${colorClass} font-medium`}>
      {label}
    </Badge>
  )
}

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

function formatCapacity(count: number, capacity: number | null): string {
  if (capacity === null) return `${count} registered · Unlimited capacity`
  const remaining = capacity - count
  if (remaining <= 0) return `Sold out`
  if (remaining <= 5) return `${count}/${capacity} · Only ${remaining} spot${remaining !== 1 ? "s" : ""} left!`
  return `${count}/${capacity} registered`
}

function EventHeader({ event, isPast }: { event: Doc<"events">; isPast: boolean }) {
  const isCancelled = event.status === "cancelled"

  return (
    <div className="relative">
      <div
        className={`aspect-video w-full overflow-hidden rounded-lg ${isCancelled ? "opacity-50 saturate-0" : ""}`}
        style={{ backgroundColor: event.coverPhoto?.dominantColor ?? "hsl(var(--muted))" }}
      />
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        {getCategoryBadge(event.category)}
        {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
        {isPast && !isCancelled && <Badge variant="secondary">Ended</Badge>}
      </div>
      <div className="mt-6 space-y-3">
        <h1
          className={`text-3xl font-bold tracking-tight sm:text-4xl ${isCancelled ? "line-through opacity-60" : ""}`}
        >
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {formatDate(event.startDatetime)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {formatTime(event.startDatetime)} – {formatTime(event.endDatetime)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {event.venue.city}, {event.venue.country}
          </span>
        </div>
      </div>
    </div>
  )
}

function EventDescription({ event }: { event: Doc<"events"> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">About this event</h2>
        <p className="mt-2 leading-relaxed whitespace-pre-wrap text-muted-foreground">{event.description}</p>
      </div>

      {event.tags.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {event.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Tag className="size-3" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Venue</h3>
        <div className="mt-2 space-y-1">
          <p className="font-medium">{event.venue.name}</p>
          <p className="text-sm text-muted-foreground">{event.venue.address}</p>
          <p className="text-sm text-muted-foreground">
            {event.venue.city}, {event.venue.country}
          </p>
        </div>
      </div>
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
  isPast,
}: {
  eventId: Id<"events">
  isOrganizer: boolean
  isRegistered: boolean
  isPast: boolean
}) {
  const event = await fetchAuthQuery(api.events.getById, { eventId })
  if (!event) return null

  const capacityText = formatCapacity(event.registrationCount, event.capacity)
  const isFull = event.capacity !== null && event.registrationCount >= event.capacity

  return (
    <Card className="sticky top-20">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{formatDate(event.startDatetime)}</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(event.startDatetime)} – {formatTime(event.endDatetime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{event.venue.name}</p>
              <p className="text-sm text-muted-foreground">{event.venue.address}</p>
              <p className="text-sm text-muted-foreground">
                {event.venue.city}, {event.venue.country}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{capacityText}</p>
          </div>
        </div>

        <Separator />

        <RegistrationCTA
          eventId={eventId}
          isOrganizer={isOrganizer}
          isRegistered={isRegistered}
          isFull={isFull}
          isPast={isPast}
          isCancelled={event.status === "cancelled"}
        />

        <Button variant="ghost" className="w-full" size="sm">
          <Share2 className="mr-2 size-4" />
          Share Event
        </Button>
      </CardContent>
    </Card>
  )
}

async function getNow(): Promise<number> {
  return new Date().getTime()
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const eventId = id as Id<"events">
  const now = await getNow()

  const detail = await fetchAuthQuery(api.discovery.getEventDetail, { eventId })

  if (!detail) {
    notFound()
  }

  const { event, isOrganizer, isRegistered } = detail
  const isPast = event.startDatetime < now
  const isFull = event.capacity !== null && event.registrationCount >= event.capacity
  const isCancelled = event.status === "cancelled"

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <EventHeader event={event} isPast={isPast} />
            <EventDescription event={event} />
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<SidebarSkeleton />}>
              <EventSidebar
                eventId={eventId}
                isOrganizer={isOrganizer}
                isRegistered={isRegistered}
                isPast={isPast}
              />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 border-t bg-background p-4 lg:hidden">
        <RegistrationCTA
          eventId={eventId}
          isOrganizer={isOrganizer}
          isRegistered={isRegistered}
          isFull={isFull}
          isPast={isPast}
          isCancelled={isCancelled}
        />
      </div>
    </div>
  )
}
