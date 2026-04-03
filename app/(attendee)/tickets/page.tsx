import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { ArrowRight, Calendar, MapPin, Ticket } from "lucide-react"
import Link from "next/link"
import { fetchAuthQuery } from "@/lib/auth-server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

function TicketCard({ reg }: { reg: { event: Doc<"events"> } & Doc<"registrations"> }) {
  const event = reg.event
  const date = new Date(event.startDatetime)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="overflow-hidden">
      <div
        className="aspect-video w-full"
        style={{ backgroundColor: event.coverPhoto?.dominantColor ?? "#3B82F6" }}
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{event.title}</CardTitle>
          <Badge variant={reg.checkedIn ? "default" : "secondary"}>
            {reg.checkedIn ? "Checked In" : "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">
            {event.venue.city}, {event.venue.country}
          </span>
        </div>
        <Link href={`/tickets/${reg.ticketCode}`}>
          <Button variant="outline" className="w-full">
            <Ticket className="mr-2 size-4" />
            View Ticket
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {validRegistrations.map(reg => (
        <TicketCard key={reg._id} reg={reg} />
      ))}
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
          <p className="mt-1 text-muted-foreground">Manage your event tickets.</p>
        </div>

        <Suspense fallback={<TicketListSkeleton />}>
          <TicketList />
        </Suspense>
      </div>
    </div>
  )
}
