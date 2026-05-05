"use client"

import { use } from "react"
import type { Id } from "@/convex/_generated/dataModel"
import { EditEvent } from "@/features/events/components/EditEvent"
import { AlertTriangle, Ban, KeyRound } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/** Validates that the event ID string contains only valid characters. */
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
          <CardDescription>The event you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/events/create">Create Event</Link>
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

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  if (!isValidEventId(id)) {
    return <InvalidEventError />
  }

  const validId = id as Id<"events">
  return <EditEvent eventId={validId} />
}
