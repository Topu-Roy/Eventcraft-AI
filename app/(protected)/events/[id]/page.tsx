import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { EventRegistrationCard } from "@/features/events/components/EventRegistrationCard"
import { ArrowLeft, Calendar, Globe, ImageIcon, MapPin, Pencil } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
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

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  completed: { label: "Completed", variant: "outline" },
}

function EventPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="mt-6 gap-6 lg:gap-8">
          <div className="space-y-6">
            <Skeleton className="aspect-video w-full rounded-lg" />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>

              <Skeleton className="h-7 w-3/4 sm:h-8" />

              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <Separator />

            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params
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

function EventContent({ data }: { data: EventData }) {
  const { event, organizer, isOrganizer, isRegistered } = data
  const now = getToday()
  const isPast = event.startDatetime < now
  const status = statusLabels[event.status] ?? { label: event.status, variant: "outline" as const }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explore">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
          {isOrganizer && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${event._id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>

        <div className="space-y-6 lg:gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant={status.variant}>{status.label}</Badge>
              {isPast && <Badge variant="outline">Past Event</Badge>}
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{event.title}</h1>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {new Date(event.startDatetime).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="size-4" />
                In-Person Event
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {event.venue.name}, {event.venue.city}, {event.venue.country}
              </span>
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {event.coverPhoto ? (
              <Image src={event.coverPhoto} alt={event.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="size-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{event.description}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {organizer && (
                <>
                  <Avatar className="size-12">
                    <AvatarImage src={organizer.avatarUrl} />
                    <AvatarFallback>{organizer.name?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{organizer.name}</p>
                    <p className="text-sm text-muted-foreground">Organizer</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          <EventRegistrationCard
            eventId={event._id}
            isOrganizer={isOrganizer}
            isRegistered={isRegistered}
            isFull={event.capacity !== undefined && event.registrationCount >= event.capacity}
            isPast={isPast}
            isCancelled={event.status === "cancelled"}
          />
        </div>
      </div>
    </div>
  )
}