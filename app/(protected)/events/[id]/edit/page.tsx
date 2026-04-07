import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { EditEvent } from "@/features/events/components/EditEvent"
import { AlertTriangle, Ban, KeyRound } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function generateMetadata({ params }: PageProps<"/events/[id]/edit">) {
  const { id } = await params

  const profileResult = await fetchAuthQuery(api.profiles.getCurrent)
  const userId = profileResult.data?.userId
  if (!userId) {
    return { title: "Edit Event — EventCraft AI" }
  }

  const eventResult = await tryCatch(fetchAuthQuery(api.events.getById, { eventId: id as Id<"events"> }))
  if (eventResult.error || !eventResult.data || eventResult.data.error) {
    return { title: "Edit Event — EventCraft AI" }
  }

  const event = eventResult.data?.data
  if (!event) {
    return { title: "Edit Event — EventCraft AI" }
  }

  return {
    title: `Edit ${event.title} — EventCraft AI`,
    description: `Edit event details for ${event.title}`,
  }
}

function isValidEventId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id)
}

function NotFoundError() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle>Event Not Found</CardTitle>
          <CardDescription>
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function UnauthorizedError({ eventId }: { eventId: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <KeyRound className="size-6 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You don&apos;t have permission to edit this event.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/events/${eventId}`}>View Event</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function InvalidEventError() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <Ban className="size-6 text-destructive" />
          </div>
          <CardTitle>Invalid Event</CardTitle>
          <CardDescription>The event ID format is invalid.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function EditEventPage({ params }: PageProps<"/events/[id]/edit">) {
  const { id } = await params

  if (!isValidEventId(id)) {
    return <InvalidEventError />
  }

  const { data, error } = await tryCatch(
    Promise.all([
      fetchAuthQuery(api.profiles.getCurrent),
      fetchAuthQuery(api.events.getById, { eventId: id as Id<"events"> }),
    ])
  )

  if (!data || error) {
    return <NotFoundError />
  }

  const [profileResult, eventResult] = data
  const profileId = profileResult.data?._id
  if (!profileId) {
    redirect("/sign-in")
  }

  if (eventResult.error) {
    return <NotFoundError />
  }

  if (eventResult) {
    if (eventResult.cause === "event_not_found") {
      return <NotFoundError />
    } else if (eventResult.cause === "profile_not_found") {
      redirect("/onboarding")
    }
  }

  const event = eventResult.data
  if (!event?.organizerId || event.organizerId !== profileId) {
    return <UnauthorizedError eventId={id} />
  }

  return <EditEvent eventId={id} />
}
