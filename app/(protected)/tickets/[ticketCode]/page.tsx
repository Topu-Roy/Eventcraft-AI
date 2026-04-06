import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { TicketDetailClient } from "@/features/scanner/components/TicketDetailClient"
import { redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"

type TicketRegistration = Doc<"registrations">
type TicketEvent = Doc<"events">

type RegistrationResponse = {
  error: boolean
  message: string | null
  cause: string | null
  data: { registration: TicketRegistration; event: TicketEvent } | null
}

export async function generateMetadata({ params }: PageProps<"/tickets/[ticketCode]">) {
  const { ticketCode } = await params

  const registrationData = await fetchAuthQuery(api.registrations.getByTicketCode, { ticketCode })
  const response = registrationData.data as RegistrationResponse | null

  if (!response || response.error || !response.data) {
    return { title: "Ticket — EventCraft AI" }
  }

  const { event } = response.data

  return {
    title: `${event.title} Ticket — EventCraft AI`,
    description: `Your ticket for ${event.title}`,
  }
}

function getCheckInBadgeVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "approved":
      return "default"
    case "rejected":
      return "destructive"
    case "pending":
      return "secondary"
    default:
      return "outline"
  }
}

function getCheckInBadgeText(status: string): string {
  switch (status) {
    case "approved":
      return "Checked In"
    case "rejected":
      return "Rejected"
    case "pending":
      return "Pending Approval"
    default:
      return "Active"
  }
}

export default async function TicketDetailPage({ params }: PageProps<"/tickets/[ticketCode]">) {
  const { ticketCode } = await params

  const [profile, registrationData] = await Promise.all([
    fetchAuthQuery(api.profiles.getCurrent),
    fetchAuthQuery(api.registrations.getByTicketCode, { ticketCode }),
  ])

  const profileId = profile.data?._id
  if (!profileId) {
    redirect("/sign-in")
  }

  const response = registrationData.data as RegistrationResponse | null
  if (!response || response.error || !response.data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-semibold">Ticket not found</h1>
          <p className="text-muted-foreground">This ticket does not exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const registration: TicketRegistration = response.data.registration
  const event: TicketEvent = response.data.event

  if (registration.profileId !== profileId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to view this ticket.</p>
        </div>
      </div>
    )
  }

  const badgeVariant = getCheckInBadgeVariant(registration.checkInStatus)
  const badgeText = getCheckInBadgeText(registration.checkInStatus)
  const eventDate = new Date(event.startDatetime)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <TicketDetailClient
      event={event}
      registration={registration}
      badgeVariant={badgeVariant}
      badgeText={badgeText}
      formattedDate={formattedDate}
      formattedTime={formattedTime}
    />
  )
}
