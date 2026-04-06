import { api } from "@/convex/_generated/api"
import { TicketDetailClient } from "@/features/scanner/components/TicketDetailClient"
import { redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"

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

  const registration = registrationData?.registration
  const event = registrationData?.event

  if (!registration || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-semibold">Ticket not found</h1>
          <p className="text-muted-foreground">This ticket does not exist or has been removed.</p>
        </div>
      </div>
    )
  }

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
