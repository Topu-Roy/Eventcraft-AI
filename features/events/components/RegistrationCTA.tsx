"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { Ban, Check, Loader2, Settings2, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type RegistrationCTAProps = {
  eventId: Id<"events">
  isOrganizer: boolean
  isRegistered: boolean
  isFull: boolean
  isPast: boolean
  isCancelled: boolean
}

const WHATS_INCLUDED = ["Event entry", "QR code ticket", "Venue check-in"]

export function RegistrationCTA({
  eventId,
  isOrganizer,
  isRegistered,
  isFull,
  isPast,
  isCancelled,
}: RegistrationCTAProps) {
  const register = useMutation(api.registrations.register)
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [registeredTicketCode, setRegisteredTicketCode] = useState<string | null>(null)

  const hasRegistered = isRegistered || registeredTicketCode !== null

  // Cancelled event
  if (isCancelled) {
    return (
      <div className="space-y-4">
        <Button variant="outline" className="w-full" disabled>
          <Ban className="mr-2 size-4" />
          Event Cancelled
        </Button>
      </div>
    )
  }

  // Past event
  if (isPast) {
    return (
      <div className="space-y-4">
        <Button variant="outline" className="w-full" disabled>
          Event Ended
        </Button>
        {hasRegistered && (
          <Button variant="secondary" className="w-full" onClick={() => router.push("/tickets")}>
            <Ticket className="mr-2 size-4" />
            View My Tickets
          </Button>
        )}
      </div>
    )
  }

  // Organizer
  if (isOrganizer) {
    return (
      <div className="space-y-4">
        <Button variant="outline" className="w-full" onClick={() => router.push(`/events/${eventId}/edit`)}>
          <Settings2 className="mr-2 size-4" />
          Manage Event
        </Button>
      </div>
    )
  }

  // Already registered
  if (hasRegistered) {
    return (
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
    )
  }

  // Event is full
  if (isFull) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Event Full
      </Button>
    )
  }

  // Default: Get Ticket
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
  )
}
