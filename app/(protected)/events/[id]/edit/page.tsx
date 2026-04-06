import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { EditEvent } from "@/features/events/components/EditEvent"
import { redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

type PageProps = {
  params: Promise<{ id: string }>
}

function isValidEventId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id)
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params

  if (!isValidEventId(id)) {
    redirect("/events/create")
  }

  const profileResult = await fetchAuthQuery(api.profiles.getCurrent)
  const userId = profileResult.data?.userId
  if (!userId) {
    redirect("/sign-in")
  }

  const eventResult = await tryCatch(fetchAuthQuery(api.events.getById, { eventId: id as Id<"events"> }))
  if (eventResult.error || !eventResult.data || eventResult.data.error) {
    redirect(`/events/${id}`)
  }

  const event = eventResult.data?.data
  if (!event?.organizerId || event.organizerId !== userId) {
    redirect(`/events/${id}`)
  }

  return <EditEvent eventId={id} />
}
