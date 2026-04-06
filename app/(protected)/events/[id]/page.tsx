import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { notFound } from "next/navigation"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"

type PageProps = {
  params: Promise<{ id: string }>
}

async function getNow() {
  return new Date().getTime()
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params

  const authed = await isAuthenticated()
  if (!authed) {
    notFound()
  }

  const eventId = id as Id<"events">
  const now = await getNow()

  const result = await tryCatch(fetchAuthQuery(api.discovery.getEventDetail, { eventId }))

  if (result.error || !result.data?.data) {
    notFound()
  }

  const response = result.data
  if (response.error || !response.data) {
    notFound()
  }

  const { event, isOrganizer, isRegistered } = response.data
  const isPast = event.startDatetime < now
  const isFull = event.capacity !== null && event.registrationCount >= event.capacity
  const isCancelled = event.status === "cancelled"

  return <div>Event: {event.title}</div>
}
