import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { ArrowLeft, Calendar, Clock, Globe, MapPin, Users } from "lucide-react"
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
    weekday: "long",
    month: "long",
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

function EventContent({ data }: { data: EventData }) {
  const { event, organizer, isOrganizer, isRegistered } = data
  const status = statusLabels[event.status] ?? { label: event.status, variant: "outline" as const }

  const backLink = isOrganizer ? `/dashboard` : `/explore`

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={backLink}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
          {isOrganizer && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${event._id}/edit`}>Edit Event</Link>
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={status.variant}>{status.label}</Badge>
            {isRegistered && <Badge variant="outline">You are registered</Badge>}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              {formatDate(event.startDatetime)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              {formatTime(event.startDatetime)} - {formatTime(event.endDatetime)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              {event.venue.city}, {event.venue.country}
            </div>
            {event.capacity != null && (
              <div className="flex items-center gap-2">
                <Users className="size-4" />
                {event.registrationCount} / {event.capacity} registered
              </div>
            )}
          </div>
        </div>

        {event.description && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{event.description}</p>
          </div>
        )}

        {event.venue.address && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Location</h2>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4" />
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

        {isRegistered && (
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/tickets?event=${String(event._id)}`}>View Your Ticket</Link>
          </Button>
        )}
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
