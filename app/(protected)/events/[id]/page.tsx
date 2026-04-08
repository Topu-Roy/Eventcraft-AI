import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { EventRegistrationCard } from "@/features/events/components/EventRegistrationCard"
import { ArrowLeft, Calendar, Globe, ImageIcon, MapPin, Pencil, Ticket, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

type EventData = {
  event: Doc<"events">
  organizer: Doc<"profile"> | null
  isOrganizer: boolean
  isRegistered: boolean
}

function getToday() {
  return Date.now()
}

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

async function EventContent({ data }: { data: EventData }) {
  const { event, organizer, isOrganizer, isRegistered } = data
  const status = statusLabels[event.status] ?? { label: event.status, variant: "outline" as const }
  const coverPhotoUrl = await fetchAuthQuery(api.storage.getUrl, {
    storageId: data.event.coverPhoto ?? ("" as Id<"_storage">),
  })
  const backLink = isOrganizer ? `/dashboard` : `/explore`

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="flex justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={backLink}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {isOrganizer && (
              <Button size="sm" asChild>
                <Link href={`/events/${event._id}/edit`}>
                  <Pencil className="mr-2 size-4" />
                  Manage
                </Link>
              </Button>
            )}
            {isRegistered && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/tickets?event=${String(event._id)}`}>
                  <Ticket className="mr-2 size-4" />
                  View Ticket
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 gap-6 lg:gap-8">
          <div className="space-y-6">
            <div>
              {event.coverPhoto ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <Image src={coverPhotoUrl ?? ""} alt={event.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                  <ImageIcon className="size-12 text-muted-foreground/50" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge variant={status.variant}>{status.label}</Badge>
                {isRegistered && <Badge variant="outline">Registered</Badge>}
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{event.title}</h1>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 shrink-0" />
                  <span className="text-xs sm:text-sm">
                    {formatDate(event.startDatetime)} · {formatTime(event.startDatetime)} -{" "}
                    {formatTime(event.endDatetime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" />
                  <span className="text-xs sm:text-sm">
                    {event.venue.city}, {event.venue.country}
                  </span>
                </div>
                {event.capacity != null && (
                  <div className="flex items-center gap-2">
                    <Users className="size-4 shrink-0" />
                    <span className="text-xs sm:text-sm">
                      {event.registrationCount} / {event.capacity} registered
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:sticky lg:top-8 lg:h-fit">
              <EventRegistrationCard
                eventId={event._id}
                isOrganizer={isOrganizer}
                isRegistered={isRegistered}
                isFull={event.capacity !== undefined && event.registrationCount >= event.capacity}
                isPast={event.endDatetime < getToday()}
                isCancelled={event.status === "cancelled"}
              />
            </div>

            <Separator />

            {event.description && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">About</h2>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground sm:text-base">
                  {event.description}
                </p>
              </div>
            )}

            {event.venue.address && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Location</h2>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p>{event.venue.address}</p>
                    <p>
                      {event.venue.city}, {event.venue.country}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {organizer && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Organizer</h2>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={organizer.avatarUrl ?? undefined} />
                    <AvatarFallback>{organizer.name?.charAt(0) ?? "O"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{organizer.name}</p>
                    {organizer.location && (
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Globe className="size-3" />
                        {organizer.location.city}, {organizer.location.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params

  const authed = await isAuthenticated()
  if (!authed) {
    notFound()
  }

  const eventId = id as Id<"events">

  const result = await tryCatch(fetchAuthQuery(api.discovery.getEventDetail, { eventId }))

  if (result.error || !result.data?.data) {
    notFound()
  }

  const response = result.data
  if (response.error || !response.data) {
    notFound()
  }

  return (
    <Suspense fallback={<EventPageSkeleton />}>
      <EventContent data={response.data} />
    </Suspense>
  )
}

function EventPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
          <div className="space-y-6">
            <Skeleton className="aspect-video w-full rounded-lg" />

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>

              <Skeleton className="h-8 w-3/4" />

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm sm:p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
