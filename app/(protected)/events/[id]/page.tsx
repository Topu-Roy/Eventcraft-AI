import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { fetchQuery } from "convex/nextjs"
import { ArrowLeft, Calendar, Globe, ImageIcon, MapPin, Pencil, Ticket, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type EventData = {
  event: Doc<"events">
  organizer: Doc<"profile"> | null
  isOrganizer: boolean
  isRegistered: boolean
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
  const coverPhotoUrl = await fetchQuery(api.storage.getUrl, {
    storageId: data.event.coverPhoto ?? ("" as Id<"_storage">),
  })
  const backLink = isOrganizer ? `/dashboard` : `/explore`

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="space-y-6">
          {event.coverPhoto ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image src={coverPhotoUrl ?? ""} alt={event.title} fill className="object-cover" />
            </div>
          ) : (
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
              <ImageIcon className="size-12 text-muted-foreground/50" />
            </div>
          )}

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

          {event.description && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground sm:text-base">{event.description}</p>
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

  return <EventContent data={response.data} />
}
