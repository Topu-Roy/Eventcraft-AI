"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { Ban, Check, LayoutDashboard, Loader2, Search, Settings2, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type EventRegistrationCardProps = {
  eventId: Id<"events">
  isOrganizer: boolean
  isRegistered: boolean
  isFull: boolean
  isPast: boolean
  isCancelled: boolean
}

const WHATS_INCLUDED = ["Event entry", "QR code ticket", "Venue check-in"]

export function EventRegistrationCard({
  eventId,
  isOrganizer,
  isRegistered,
  isFull,
  isPast,
  isCancelled,
}: EventRegistrationCardProps) {
  const register = useMutation(api.registrations.register)
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [registeredTicketCode, setRegisteredTicketCode] = useState<string | null>(null)

  const hasRegistered = isRegistered || registeredTicketCode !== null

  if (isCancelled) {
    return (
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg shadow-sm md:flex-row">
        <Button
          variant="outline"
          className="w-full flex-1 py-2"
          onClick={() => router.push(`/events/${eventId}/edit`)}
        >
          <Search className="mr-2 size-4" />
          Explore more
        </Button>
        <Button variant="outline" className="w-full flex-1 py-2" disabled>
          <Ban className="mr-2 size-4" />
          Event Cancelled
        </Button>
      </div>
    )
  }

  if (isPast) {
    return (
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg shadow-sm md:flex-row">
        <div className="space-y-4">
          <Button variant="outline" className="w-full flex-1 py-2" disabled>
            Event Ended
          </Button>
          {hasRegistered && (
            <Button variant="secondary" className="w-full flex-1 py-2" onClick={() => router.push("/tickets")}>
              <Ticket className="mr-2 size-4" />
              View My Tickets
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (isOrganizer) {
    return (
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg shadow-sm md:flex-row">
        <Button
          variant="outline"
          className="w-full flex-1 py-2"
          onClick={() => router.push(`/events/${eventId}/edit`)}
        >
          <LayoutDashboard className="mr-2 size-4" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          className="w-full flex-1 py-2"
          onClick={() => router.push(`/events/${eventId}/edit`)}
        >
          <Settings2 className="mr-2 size-4" />
          Manage Event
        </Button>
      </div>
    )
  }

  if (hasRegistered) {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
        <div className="space-y-4">
          <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="size-4" />
              </div>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">You&apos;re in!</p>
                <p className="text-xs text-green-600 dark:text-green-400">Your ticket is ready.</p>
              </div>
            </CardContent>
          </Card>
          <Button className="w-full" onClick={() => router.push(`/tickets/${registeredTicketCode ?? ""}`)}>
            <Ticket className="mr-2 size-4" />
            View Your Ticket
          </Button>
        </div>
      </div>
    )
  }

  if (isFull) {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
        <Button variant="outline" className="w-full" disabled>
          Event Full
        </Button>
      </div>
    )
  }

  async function handleRegister() {
    setIsRegistering(true)
    const result = await tryCatch(() => register({ eventId }))
    if (result.error) {
      toast.error(result.error.message)
      setIsRegistering(false)
      return
    }
    const mutationResult = result.data
    if (mutationResult?.error) {
      toast.error(mutationResult.cause)
      setIsRegistering(false)
      return
    }
    if (!mutationResult?.data?.ticketCode) {
      toast.error("Failed to register")
      setIsRegistering(false)
      return
    }
    setRegisteredTicketCode(mutationResult.data.ticketCode)
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">What&apos;s included</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {WHATS_INCLUDED.map(item => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-3.5 shrink-0 text-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <Button className="w-full" onClick={handleRegister} disabled={isRegistering}>
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Getting your ticket...
            </>
          ) : (
            <>
              <Ticket className="mr-2 size-4" />
              Get Ticket
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
