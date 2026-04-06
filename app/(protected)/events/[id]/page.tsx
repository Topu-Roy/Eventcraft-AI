import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { notFound } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

export async function generateMetadata({ params }: PageProps<"/events/[id]">) {
  const { id } = await params
  const eventId = id as Id<"events">

  const authed = await isAuthenticated()
  if (!authed) {
    return { title: "Event — EventCraft AI" }
  }

  const result = await tryCatch(fetchAuthQuery(api.discovery.getEventDetail, { eventId }))

  if (result.error || !result.data?.data) {
    return { title: "Event — EventCraft AI" }
  }

  const response = result.data
  if (response.error || !response.data) {
    return { title: "Event — EventCraft AI" }
  }

  const { event } = response.data

  return {
    title: `${event.title} — EventCraft AI`,
    description: event.description?.slice(0, 160) ?? "Event details",
  }
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

  const { event } = response.data

  return <div>Event: {event.title}</div>
}
