import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { EditEvent } from "@/features/events/components/EditEvent"
import { notFound, redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

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

export default async function EditEventPage({ params }: PageProps<"/events/[id]/edit">) {
  const { id } = await params

  if (!isValidEventId(id)) {
    notFound()
  }

  const { data, error } = await tryCatch(
    Promise.all([
      fetchAuthQuery(api.profiles.getCurrent),
      fetchAuthQuery(api.events.getById, { eventId: id as Id<"events"> }),
    ])
  )

  if (!data || error) {
    notFound()
  }

  const [profileResult, eventResult] = data
  const userId = profileResult.data?.userId
  if (!userId) {
    redirect("/sign-in")
  }

  if (eventResult.error) {
    console.log(eventResult.error)

    redirect(`/events/${id}`)
  }

  if (eventResult) {
    if (eventResult.cause === "event_not_found" || eventResult.cause === "not_authorized") {
      notFound()
    } else if (eventResult.cause === "profile_not_found") {
      redirect("/onboarding")
    }
  }

  const event = eventResult.data
  if (!event?.organizerId || event.organizerId !== userId) {
    redirect(`/events/${id}`)
  }

  return <EditEvent eventId={id} />
}
